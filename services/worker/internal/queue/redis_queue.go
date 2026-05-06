package queue

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type GenerationJob struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organization_id"`
}

type RedisQueue struct {
	client *redis.Client
	queue  string
}

func NewRedisQueue(client *redis.Client, queueName string) *RedisQueue {
	return &RedisQueue{
		client: client,
		queue:  queueName,
	}
}

func (q *RedisQueue) Push(ctx context.Context, job *GenerationJob) error {
	data, err := json.Marshal(job)
	if err != nil {
		return err
	}

	return q.client.RPush(ctx, q.queue, data).Err()
}

func (q *RedisQueue) Pop(ctx context.Context, timeout time.Duration) (*GenerationJob, error) {
	result, err := q.client.BLPop(ctx, timeout, q.queue).Result()
	if err != nil {
		return nil, err
	}

	if len(result) < 2 {
		return nil, nil
	}

	var job GenerationJob
	if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
		return nil, err
	}

	return &job, nil
}
