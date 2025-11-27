# Zero to Hero

A modern, responsive educational platform built with Next.js 15, Tailwind CSS, and MongoDB.

## Features

-   **Modern UI/UX**: Responsive design with glassmorphism effects, smooth animations (Framer Motion), and a clean aesthetic.
-   **Services Section**: Horizontal scrollable layout for service cards with detailed modal views.
-   **Contact Form**: Fully functional contact form with email notifications (Nodemailer) and database storage.
-   **Global Modal**: "Join Us" modal accessible from multiple call-to-action points.
-   **Founder Section**: Sticky layout for desktop, optimized for mobile.

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
-   **Email**: [Nodemailer](https://nodemailer.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

-   Node.js 18+ installed
-   MongoDB Atlas account (or local MongoDB)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Kavinnandha/ztoh.git
    cd ztoh
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory based on `.env.example`:

    ```bash
    cp .env.example .env
    ```

    Fill in your credentials:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_specific_password
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is ready to be deployed on [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the **Environment Variables** (MONGODB_URI, SMTP_*, etc.) in the Vercel project settings.
4.  Deploy!

## Project Structure

-   `src/app`: Next.js App Router pages and API routes.
-   `src/components`: Reusable UI components (sections, layout, ui).
-   `src/lib`: Utility functions and database connection.
-   `src/models`: Mongoose data models.

## License

[MIT](LICENSE)
