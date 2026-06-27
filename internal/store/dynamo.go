package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

// DynamoStore is a DynamoDB implementation of PipelineStore.
// Connects to AWS DynamoDB (or LocalStack for local development).
type DynamoStore struct {
	client    *dynamodb.Client
	tableName string
}

// NewDynamoStore creates a new DynamoDB pipeline store.
// cfg should contain AWS_REGION, AWS_ENDPOINT_URL (optional), and credentials.
func NewDynamoStore(ctx context.Context, tableName, region, endpoint string) (*DynamoStore, error) {
	var cfg aws.Config
	var err error

	if endpoint != "" {
		// LocalStack or custom endpoint
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(region),
			config.WithEndpointResolverWithOptions(
				aws.EndpointResolverWithOptionsFunc(
					func(service, region string, options ...interface{}) (aws.Endpoint, error) {
						return aws.Endpoint{URL: endpoint}, nil
					},
				),
			),
		)
	} else {
		// Real AWS
		cfg, err = config.LoadDefaultConfig(ctx, config.WithRegion(region))
	}

	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}

	client := dynamodb.NewFromConfig(cfg)

	return &DynamoStore{
		client:    client,
		tableName: tableName,
	}, nil
}

// Save creates a new pipeline in DynamoDB. Generates ID if empty.
func (s *DynamoStore) Save(ctx context.Context, pipeline *Pipeline) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	if pipeline.ID == "" {
		pipeline.ID = uuid.New().String()
	}

	now := time.Now().UTC()
	pipeline.CreatedAt = now
	pipeline.UpdatedAt = now

	// Marshal Pipeline to DynamoDB AttributeValue
	av, err := attributevalue.MarshalMap(pipeline)
	if err != nil {
		return fmt.Errorf("failed to marshal pipeline: %w", err)
	}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.tableName),
		Item:      av,
	})

	if err != nil {
		return fmt.Errorf("failed to save pipeline: %w", err)
	}

	return nil
}

// Get retrieves a pipeline by ID from DynamoDB.
func (s *DynamoStore) Get(ctx context.Context, id string) (*Pipeline, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	result, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get pipeline: %w", err)
	}

	if len(result.Item) == 0 {
		return nil, ErrNotFound
	}

	var pipeline Pipeline
	err = attributevalue.UnmarshalMap(result.Item, &pipeline)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal pipeline: %w", err)
	}

	return &pipeline, nil
}

// List returns all pipelines from DynamoDB.
func (s *DynamoStore) List(ctx context.Context) ([]*Pipeline, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	result, err := s.client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(s.tableName),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to scan pipelines: %w", err)
	}

	pipelines := make([]*Pipeline, 0, len(result.Items))

	for _, item := range result.Items {
		var pipeline Pipeline
		err := attributevalue.UnmarshalMap(item, &pipeline)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal pipeline: %w", err)
		}
		pipelines = append(pipelines, &pipeline)
	}

	return pipelines, nil
}

// Update modifies an existing pipeline in DynamoDB.
func (s *DynamoStore) Update(ctx context.Context, pipeline *Pipeline) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	// Check if pipeline exists
	_, err := s.Get(ctx, pipeline.ID)
	if err != nil {
		return err
	}

	pipeline.UpdatedAt = time.Now().UTC()

	// Marshal updated pipeline
	av, err := attributevalue.MarshalMap(pipeline)
	if err != nil {
		return fmt.Errorf("failed to marshal pipeline: %w", err)
	}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.tableName),
		Item:      av,
	})

	if err != nil {
		return fmt.Errorf("failed to update pipeline: %w", err)
	}

	return nil
}

// Delete removes a pipeline from DynamoDB.
func (s *DynamoStore) Delete(ctx context.Context, id string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	// Check if pipeline exists
	_, err := s.Get(ctx, id)
	if err != nil {
		return err
	}

	_, err = s.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(s.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		return fmt.Errorf("failed to delete pipeline: %w", err)
	}

	return nil
}
