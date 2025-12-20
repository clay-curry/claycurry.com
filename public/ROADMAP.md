# Roadmap

**Problem**:

- applications type:
  - traffic < 1 TPS (non-fluctuating)
  - contributors < 3 (code push)

- incurs significant waste due to
  - expensive, warm (fast): over-provisioned compute, cache, database, and storage resources
  - cheap, cold (slow): under-provisioned serverless compute, cache, database, and storage resources

- read and write APIs (storage or DBMS) are the preferred method for persisting state.

**Solution**:

- serverless container image (for loop)
  1. workflow: build ECR fargate image
  2. database / storage write accumulator
  3. write to ephemeral storage
  4. write to persisistent volume
  5. container eviction policy

## Demonstration

Link to GitHub repo.
