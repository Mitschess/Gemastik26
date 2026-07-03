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

## Quick: Run server locally and test via Windows hotspot

If you want to run just the minimal server (teacher laptop) and have students connect over a Windows hotspot, do the following:

1. Start server in the `server` folder:

```powershell
cd server
npm install
npm run start
```

2. Enable Mobile hotspot on Windows (Settings > Network & Internet > Mobile hotspot) or via PowerShell (Admin):

```powershell
netsh wlan set hostednetwork mode=allow ssid=MyHotspot key=MyPassword
netsh wlan start hostednetwork
```

3. Students connect to the hotspot and open a browser to http://<TEACHER_IP>:5000/student.html

4. Submissions are stored in `server/data/submissions.json`. Teacher can view them at http://<TEACHER_IP>:5000/teacher.html

Security note: this is a minimal demo; do not use in production without adding authentication and input validation.