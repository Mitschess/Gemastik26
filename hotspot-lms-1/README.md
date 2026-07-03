# Hotspot LMS

Hotspot LMS is a web application designed to facilitate the connection between students and teachers through a dedicated Wi-Fi hotspot. This application allows students to submit their work directly to the teacher's laptop, streamlining the submission process and enhancing classroom interaction.

## Features

- **Student Submission**: Students can upload their assignments and projects through a user-friendly interface.
- **Teacher Dashboard**: Teachers can view and manage submissions easily from their desktop application.
- **Wi-Fi Connectivity**: Students connect to the teacher's Wi-Fi hotspot to access the application.
- **Real-time Updates**: Submissions are recorded in real-time, ensuring that teachers have immediate access to student work.

## Project Structure

The project is organized into three main components:

1. **Server**: Handles API requests, authentication, and data storage.
   - Located in the `server` directory.
   - Built with TypeScript and Express.

2. **Client**: The front-end application for students and teachers.
   - Located in the `client` directory.
   - Built with React and TypeScript.

3. **Teacher Desktop**: A dedicated application for teachers to manage submissions.
   - Located in the `teacher-desktop` directory.
   - Built with TypeScript.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hotspot-lms
   ```

2. Install dependencies for the server:
   ```
   cd server
   npm install
   ```

3. Install dependencies for the client:
   ```
   cd ../client
   npm install
   ```

4. Install dependencies for the teacher desktop application:
   ```
   cd ../teacher-desktop
   npm install
   ```

5. Set up environment variables:
   - Copy the `.env.example` files in each directory to `.env` and configure them as needed.

## Running the Application

To start the server, run:
```
cd server
npm start
```

To start the client, run:
```
cd client
npm start
```

To start the teacher desktop application, run:
```
cd teacher-desktop
npm start
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.