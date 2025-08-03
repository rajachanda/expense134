# Expense Tracker API

This is the backend API for a comprehensive expense tracking application. It allows users to manage their expenses, view statistics, and track their budget. The API is built with Node.js, Express, and uses Supabase for the database and authentication.

## Features

-   User authentication and authorization.
-   Full CRUD (Create, Read, Update, Delete) functionality for expenses.
-   Pagination and sorting for expense lists.
-   Detailed expense statistics (monthly total, weekly total, category breakdown).
-   Top 5 expenses for the current month.
-   Monthly budget progress tracking.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** Supabase (PostgreSQL)
-   **Date Management:** `date-fns`

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v14 or higher)
-   npm
-   A Supabase account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd expense134
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `server` directory and add the following environment variables. You can get these from your Supabase project settings.

    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_KEY=your_supabase_anon_key
    PORT=5000
    ```

4.  **Start the server:**
    ```sh
    npm start
    ```
    The server will be running on `http://localhost:5000`.

## API Endpoints for Testing

All endpoints are prefixed with `/api`. For protected routes, you must include an `Authorization` header with the value `Bearer <YOUR_JWT_TOKEN>`.

### Authentication

#### Register a new user
-   **Endpoint:** `POST /api/auth/signup`
-   **Body:**
    ```json
    {
      "email": "testuser@example.com",
      "password": "yoursecurepassword"
    }
    ```

#### Login a user
-   **Endpoint:** `POST /api/auth/login`
-   **Body:**
    ```json
    {
      "email": "testuser@example.com",
      "password": "yoursecurepassword"
    }
    ```
-   **Response:** This will return a JWT token that you need to use for authenticated requests.

### Expenses

#### Get all expenses
-   **Endpoint:** `GET /api/expenses`
-   **Description:** Get a paginated list of expenses for the authenticated user.
-   **Query Params:** `sortBy` (e.g., 'date'), `sortOrder` ('asc'/'desc'), `limit` (number), `page` (number).
-   **Example:** `GET /api/expenses?sortBy=amount&sortOrder=desc&page=1&limit=5`

#### Get a single expense
-   **Endpoint:** `GET /api/expenses/:id`
-   **Example:** `GET /api/expenses/your-expense-id`

#### Create a new expense
-   **Endpoint:** `POST /api/expenses`
-   **Body:**
    ```json
    {
      "title": "Groceries",
      "amount": 75.50,
      "category": "Food",
      "date": "2023-10-28T14:00:00.000Z",
      "note": "Weekly shopping"
    }
    ```

#### Update an existing expense
-   **Endpoint:** `PUT /api/expenses/:id`
-   **Example:** `PUT /api/expenses/your-expense-id`
-   **Body:**
    ```json
    {
      "title": "Dinner with friends",
      "amount": 55.00,
      "category": "Social",
      "date": "2023-10-29T19:30:00.000Z",
      "note": ""
    }
    ```

#### Delete an expense
-   **Endpoint:** `DELETE /api/expenses/:id`
-   **Example:** `DELETE /api/expenses/your-expense-id`

### Statistics & Budget

#### Get expense statistics
-   **Endpoint:** `GET /api/expenses/stats`
-   **Description:** Get expense statistics for the current month (monthly total, weekly total, spending by category, and top 5 expenses).

#### Get budget progress
-   **Endpoint:** `GET /api/expenses/budget-progress`
-   **Description:** Get the user's budget progress for the current month (total spent, total budget, remaining amount, and percentage spent).

## Database Schema

### `expenses` table

| Column     | Type        | Description                               |
| :--------- | :---------- | :---------------------------------------- |
| `id`       | `uuid`      | Primary Key                               |
| `user_id`  | `uuid`      | Foreign Key to `auth.users.id`            |
| `title`    | `text`      | Title of the expense                      |
| `amount`   | `numeric`   | Amount of the expense                     |
| `category` | `text`      | Category of the expense (e.g., Food, Rent) |
| `date`     | `timestamp` | Date of the expense                       |
| `note`     | `text`      | Optional note for the expense             |
| `created_at`|`timestamp` | Timestamp of creation                     |

### `users` table (in `auth` schema)

Supabase's built-in `auth.users` table is used. A custom `monthly_budget` column should be added to the `users` table or a separate `profiles` table.
