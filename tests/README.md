# iRxcruit Backend Tests

This directory contains tests for the iRxcruit backend API.

## Running Tests

To run the tests, make sure you have pytest installed and then run the following command from the project root directory:

```bash
pytest
```

Or to run tests with more detailed output:

```bash
pytest -v
```

To run a specific test file:

```bash
pytest tests/test_public_routes.py -v
```

## Test Structure

The tests are organized as follows:

- `test_public_routes.py`: Tests for public routes (homepage, job listings, etc.)
- `test_talent_routes.py`: Tests for talent-specific routes (to be implemented)
- `test_employer_routes.py`: Tests for employer-specific routes (to be implemented)
- `test_trainer_routes.py`: Tests for trainer-specific routes (to be implemented)
- `test_admin_routes.py`: Tests for admin-specific routes (to be implemented)

## Writing Tests

When writing tests, follow these guidelines:

1. Use the `test_db` fixture to set up and tear down the test database
2. Create test data in the fixture as needed
3. Use descriptive test names that indicate what is being tested
4. Test both successful and error cases
5. Keep tests independent of each other

## Example Test

```python
def test_get_jobs(test_db):
    response = client.get("/jobs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```