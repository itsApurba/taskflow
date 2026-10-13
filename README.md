# TaskFlow Task Planner App

## Introduction

TaskFlow is a task planner application that allows users to manage and track different types of tasks, such as bugs, features, and stories. It provides a comprehensive set of features to create sprints, add tasks to sprints, change task assignees and statuses, and view tasks associated with specific sprints. This readme file provides an overview of the application's features, technologies used, and instructions for setting up and running the project.
## Features

This project has the following features:

* Create tasks with the following attributes
* Manage sprints
* User management
* Task management
* Gamified task market: managers post tasks with a credit reward, workers claim them, and credits are paid when the manager approves the work
* Wallet with a credit balance and history, plus XP, levels, streaks and a team leaderboard
* Rewards store (e.g. "Join a special weekend with Rohit sir", "Skip a boring festival", event tickets) and penalties that workers clear with credits

The backend API, roles and game rules are documented in [`backend/API.md`](backend/API.md).

```mermaid
classDiagram
  class Task {
    +title: String
    +type: "bug" | "feature" | "story"
    +description: String
    +assignee: User
    +status: "open" | "in progress" | "in review" | "done"
    +reward: Number
    +createdBy: User
  }

  class User {
    +name: String
    +email: String
    +password: String
    +role: "manager" | "worker"
    +reportsTo: User
    +credits: Number
    +xp: Number
    +tasks: [Task]
  }

  class Sprint {
    +name: String
    +startDate: Date
    +endDate: Date
    +tasks: [Task]
  }

  User --|> Sprint : "creates a sprint"
  Task --|> Sprint : "contains a task"
  User --|> Task : "assigned to a user"
```

## Technologies Used

The taskFlow application utilizes the following technologies:

- Frontend:
  - React: A JavaScript library for building user interfaces.
  - ChakraUI: A simple and modular UI component library for React.
  - Zustand: A small and fast state management library for React.
  - React Query: A data-fetching and caching library for React applications.
  - Formik: A form library for handling form input and validation in React.
  - Moment: A library for parsing, validating, manipulating, and formatting dates and times in JavaScript.
  - Yup: A JavaScript schema builder for value parsing and validation.

- Backend and Database:
  - Node.js: A JavaScript runtime for server-side development.
  - Express: A web application framework for Node.js.
  - JWT (JSON Web Tokens): A standard for securely transmitting information between parties as a JSON object.
  - Mongoose: An object data modeling (ODM) library for MongoDB and Node.js.
  - MongoDB: A document-oriented NoSQL database.

## Getting Started

To run the TaskFlow application locally, please follow the steps below:
To install this project, you will need the following:

* Node.js `^20.19.0 || ^22.13.0 || >=24` (npm)
* MongoDB
* Git

Once you have installed Node.js, MongoDB and Git, you can install this project by running the following command in your terminal:


1. Clone the repository:

```bash
git clone https://github.com/itsApurba/taskFlow.git
```

2. Navigate to the project directory:

```bash
cd taskFlow
```

3. Install the dependencies for both the frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm i

# Install backend dependencies
cd backend
npm i
```

4. Set up the environment variables:

- Backend: copy `backend/.env.example` to `backend/.env` and fill it in (see the variable table under [Deploy to Vercel](#deploy-to-vercel)).
- Frontend: create `frontend/.env` with `VITE_BACKEND_URL=http://localhost:3939/api`.

5. Start the development servers:

```bash
# Start the frontend server
cd frontend
npm run dev

# Start the backend server
cd backend
npm run dev
```

6. (Optional) Load demo data into the database from `MONGO_URI` (or `MONGODB_URI`):

```bash
cd backend
npm run seed
```

This replaces only the `@taskflow.demo` accounts and their data. Every demo account uses the password `taskflow123`:

| Role | Email |
| --- | --- |
| Manager | `rohit@taskflow.demo` (Rohit Sharma) |
| Worker | `asha@taskflow.demo` (Asha Verma) |
| Worker | `vikram@taskflow.demo` (Vikram Singh) |
| Worker | `meera@taskflow.demo` (Meera Iyer) |

7. Run the backend API tests (they start their own in-memory MongoDB, no `.env` needed):

```bash
cd backend
npm test
```

8. Access the application in your web browser:

Open your preferred web browser and visit `http://localhost:5173` to access the taskFlow application.

## Deploy to Vercel

The repo deploys as two Vercel projects from the same Git repository. Create each one with **Add New → Project**, import the repo, and set its **Root Directory**.

### Backend project (Root Directory `backend`)

`backend/api/index.js` is the serverless function and `backend/vercel.json` rewrites `/` and `/api/*` to it, so the routes stay at `https://<backend>.vercel.app/api/...`. Each instance connects to MongoDB once and reuses the connection on warm requests. If a required variable is missing, requests fail with `500 {"message":"Server is not configured"}` and the function log names the variable. If the database is unreachable, requests fail with `503`.

Set these under **Settings → Environment Variables**, then redeploy:

| Variable | Required | Value |
| --- | --- | --- |
| `MONGODB_URI` or `MONGO_URI` | yes | Atlas connection string, including the database name (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/taskflow`). The Vercel MongoDB Atlas integration sets `MONGODB_URI` for you. If both are set, `MONGO_URI` wins. |
| `JWT_SECRET` | yes | A long random value, e.g. the output of `openssl rand -base64 48`. Never reuse the example value. Changing it logs everyone out. |
| `JWT_EXPIRATION_MINUTES` | no | Access token lifetime in minutes (default `15`). |
| `CORS_ORIGIN` | no | Comma-separated allowed origins, e.g. `https://taskflow-one.vercel.app`. Unset allows every origin. |
| `NODE_ENV` | no | Vercel already runs functions with `production`, which hides internal error details from responses. |

**MongoDB Atlas:** Vercel functions have no fixed outbound IP. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so the function can connect. The integration may do this for you.

**Demo data (one time):** load the demo accounts into Atlas from your laptop:

```bash
cd backend
npm i
MONGO_URI='mongodb+srv://user:pass@cluster.mongodb.net/taskflow' npm run seed
```

Pass the Atlas string as `MONGO_URI`: a variable set in the shell wins over `backend/.env`, because dotenv does not override existing variables.

### Frontend project (Root Directory `frontend`)

Vercel detects Vite and builds `dist`. `frontend/vercel.json` rewrites every non-file path to `index.html`, so deep links such as `/market` load the app instead of a 404.

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_BACKEND_URL` | yes | The backend URL **including `/api`**, e.g. `https://<backend>.vercel.app/api`. |

`VITE_BACKEND_URL` is compiled into the bundle, so redeploy the frontend after changing it. Then set the backend's `CORS_ORIGIN` to the frontend's URL.
