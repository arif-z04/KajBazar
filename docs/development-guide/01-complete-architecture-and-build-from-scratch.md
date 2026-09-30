# Volume 01: Complete Architecture & Build From Scratch Guide
## A Beginner-Friendly, Step-by-Step Blueprint for Building KajBazar from Zero

---

## 📖 Welcome, Future Software Engineer!

If you have never built a full-stack software application before, or if phrases like *"3-tier layered architecture"*, *"Entity Framework Core"*, *"Dependency Injection"*, *"REST API"*, and *"Single Page Application"* make your head spin—**take a deep breath**. You are in the right place.

This comprehensive guide was written specifically to explain every single brick, beam, and nail of **KajBazar** as if you are starting from an absolute clean slate on a brand-new computer with nothing installed. We assume zero prior knowledge of enterprise software engineering patterns. Every single concept will first be explained using intuitive, physical real-world analogies before we touch a terminal, write a command, or inspect a single line of code.

By the time you finish this volume, you will not only understand how KajBazar is structured; you will understand **why** professional software engineers structure modern enterprise web systems this way, how computers talk to each other across networks, and how to construct this entire project from a blank terminal.

---

## 📑 Master Table of Contents

1. [The "Dumb Person" Mental Model: How Modern Web Systems Actually Work](#1-the-dumb-person-mental-model-how-modern-web-systems-actually-work)
   - 1.1 The Restaurant Analogy: Customer, Waiter, Kitchen, and Cold Storage
   - 1.2 What is a Client (The Browser, DOM, and React.js)?
   - 1.3 What is a Server (ASP.NET Core 8 Kestrel Web API)?
   - 1.4 What is a Database (PostgreSQL Relational Storage)?
   - 1.5 What is HTTP and JSON (The Universal Language of the Web)?
   - 1.6 What is an Operating System Process, Thread, and Network Port?
   - 1.7 How the Internet Moves Packets: DNS, IP Addresses, TCP Handshakes, and Sockets
2. [High-Level Architecture of KajBazar](#2-high-level-architecture-of-kajbazar)
   - 2.1 The 3-Tier Layered Architecture
   - 2.2 Why We Divided the Backend into 3 C# Projects (Clean Architecture / Onion Model)
   - 2.3 The Dependency Inversion Principle Explained Simply
   - 2.4 Separation of Concerns: The Golden Rule of Maintainable Systems
   - 2.5 ASCII Architecture Blueprint of the Entire System
3. [Prerequisites & Machine Setup](#3-prerequisites--machine-setup)
   - 3.1 Hardware, RAM, CPU, and Disk Space Requirements
   - 3.2 Operating System Guides (Ubuntu/Debian Linux, macOS, and Windows 11)
   - 3.3 Installing and Configuring Git
   - 3.4 Installing .NET 8 SDK (SDK vs Runtime vs CLI)
   - 3.5 Installing Node.js & npm (Using NVM for Version Control)
   - 3.6 Installing and Securing PostgreSQL 15+
   - 3.7 Recommended Developer Tooling (VS Code, C# Dev Kit, Postman, curl)
4. [Step-by-Step Construction from an Empty Directory](#4-step-by-step-construction-from-an-empty-directory)
   - 4.1 Step 1: Initialize the Root Folder and Git Repository
   - 4.2 Step 2: Create the .NET Solution and 4 Project Libraries
   - 4.3 Step 3: Wire Up Project References (Inter-Project Dependencies)
   - 4.4 Step 4: Install Required NuGet Packages
   - 4.5 Step 5: Initialize the Frontend Application with Vite & React
   - 4.6 Step 6: Install Frontend npm Packages
   - 4.7 Step 7: Create the Database SQL Scripts Directory
   - 4.8 Step 8: Initialize Documentation and Diagrams
5. [Deep Dive into the Solution Files and `.csproj` XML](#5-deep-dive-into-the-solution-files-and-csproj-xml)
   - 5.1 Understanding `KajBazar.sln` Line-by-Line
   - 5.2 Anatomy of `KajBazar.Core.csproj` Line-by-Line
   - 5.3 Anatomy of `KajBazar.Infrastructure.csproj` Line-by-Line
   - 5.4 Anatomy of `KajBazar.API.csproj` Line-by-Line
   - 5.5 Anatomy of `KajBazar.Tests.csproj` Line-by-Line
   - 5.6 Anatomy of `client/package.json` Line-by-Line
   - 5.7 Anatomy of `client/vite.config.js` Line-by-Line
   - 5.8 Anatomy of `.gitignore` Line-by-Line
6. [Deep Dive into the Folder Structure and Every File](#6-deep-dive-into-the-folder-structure-and-every-file)
   - 6.1 Master Repository Tree Listing
   - 6.2 Detailed Explanation of Every Directory and File
   - 6.3 Configuration Files: `appsettings.json`, `appsettings.Development.json`, `launchSettings.json`
7. [The Lifecycle of a Web Request: From User Click to Disk and Back](#7-the-lifecycle-of-a-web-request-from-user-click-to-disk-and-back)
   - 7.1 Chronological 22-Step Trace of a Search Request
   - 7.2 What Happens in the Browser (DOM Events, React State, Axios)
   - 7.3 What Happens on the Network (TCP Packets, TLS, HTTP Headers)
   - 7.4 What Happens in Kestrel & ASP.NET Core Middleware
   - 7.5 What Happens in the Controller & Dependency Injection
   - 7.6 What Happens in Entity Framework Core & Npgsql
   - 7.7 What Happens Inside PostgreSQL (Engine, Buffers, B-Tree Index, Disk I/O)
   - 7.8 The Journey Back: JSON Serialization, HTTP 200 OK, React Virtual DOM Reconciliation
8. [Running the Entire Platform Locally](#8-running-the-entire-platform-locally)
   - 8.1 Database Initialization: Creating DB, running DDL, running seed data
   - 8.2 Running Backend API with `dotnet run`
   - 8.3 Running Frontend Vite Server with `npm run dev`
   - 8.4 Verifying Full-Stack Integration in the Browser
   - 8.5 Testing Live Endpoints with `curl`
9. [Common Beginner Pitfalls & How to Avoid Them](#9-common-beginner-pitfalls-and-how-to-avoid-them)
   - 9.1 Circular Dependencies Between Projects
   - 9.2 Port Collisions (Port 5000, 5432, 5173 Already in Use)
   - 9.3 Case Sensitivity in PostgreSQL vs C# (Snake_case vs PascalCase)
   - 9.4 Forgetting `await` in Asynchronous Methods
   - 9.5 CORS Errors (Cross-Origin Resource Sharing)
   - 9.6 Environment Variable and Connection String Misconfigurations
10. [Hands-on Beginner Exercises & Practical Challenges](#10-hands-on-beginner-exercises-and-practical-challenges)
    - 10.1 Exercise 1: Adding a New Field to an Entity
    - 10.2 Exercise 2: Adding a Custom Health Check Endpoint
    - 10.3 Exercise 3: Adding a Custom Filter to the Frontend
    - 10.4 Exercise 4: Writing a Custom Middleware for Request Duration
    - 10.5 Exercise 5: Adding a Worker Profile Card Badge
11. [Frequently Asked Questions (FAQ) for Absolute Beginners](#11-frequently-asked-questions-faq-for-absolute-beginners)
12. [Conclusion & Roadmap to Volume 02](#12-conclusion-and-roadmap-to-volume-02)

---

## 1. The "Dumb Person" Mental Model: How Modern Web Systems Actually Work

Before touching any technical terminology, let us understand what software applications actually do in the physical world.

### 1.1 The Restaurant Analogy: Customer, Waiter, Kitchen, and Cold Storage

Imagine a busy, traditional Bengali restaurant in Patuakhali called **"KajBazar Dining"**. Every day, hundreds of people walk in to eat lunch. To serve people smoothly without chaos, the restaurant divides work among four distinct roles:

```
+----------------------------------------------------------------------------------------------------+
|                                    THE RESTAURANT ANALOGY                                          |
|                                                                                                    |
|  [ Customer at Table ]        [ The Waiter ]             [ The Head Chef ]     [ Cold Storage Room]|
|       (FRONTEND)                 (BACKEND)                  (DATABASE ENGINE)       (PHYSICAL DISK)|
|                                                                                                    |
|  1. Looks at printed menu.   2. Takes order pad.        3. Verifies ingredients.4. Opens metal bins|
|  2. Decides on Ilish Polao.  3. Validates order:           Reads recipe ledger.    Pulls fresh fish|
|  3. Signals waiter & orders.    - Is table valid?          Directs line cooks.     Pulls rice/ghee |
|                             4. Walks order to kitchen.  5. Plates hot meal.        Updates ledger  |
|                                                                                                    |
|  8. Receives hot plate! <--- 7. Carries plate to table <--- 6. Hands plate over                     |
|     Eats, leaves review.        Collects payment note.         Prepares next order.                |
+----------------------------------------------------------------------------------------------------+
```

Let us break down each physical role and see how it maps directly to KajBazar:

1. **The Customer (Frontend - React.js in the Web Browser)**:
   - The customer sits at a table. They cannot go into the kitchen. They do not know how the stove works, where the raw fish is stored, or how the chef prepares the spices.
   - The customer only sees what is placed in front of them: a visual menu with pretty pictures, prices, and buttons.
   - In our application, **React.js** is the customer-facing interface running inside the user's Google Chrome or Firefox browser. It draws buttons, cards, search bars, and dropdown menus on the screen.

2. **The Waiter (Backend API - ASP.NET Core 8 Web API)**:
   - The customer cannot shout directly into the refrigerator to grab food. If customers could walk into the kitchen, someone might steal food, contaminate ingredients, or cause an explosion.
   - Instead, the customer speaks to the **Waiter**.
   - The waiter listens politely, checks the rules (*"Are you 18 or older to order this? Is the kitchen currently open? Did you provide your phone number?"*), writes down the request on an order slip in standard shorthand (JSON), and carries it to the kitchen.
   - In KajBazar, **ASP.NET Core 8** is the waiter. It sits between the user's browser and the database. It enforces security, checks passwords, validates business rules (e.g. *Rule BR-06: Customers must explicitly click 'Call Worker' to view phone numbers*), and handles errors gracefully.

3. **The Head Chef & Kitchen (Database Engine - PostgreSQL)**:
   - The kitchen receives the order slip from the waiter. The chef does not talk to the customer directly.
   - The chef knows where every spice, vegetable, and cut of meat is stored. The chef follows strict mathematical recipes (SQL queries) to find, slice, filter, and combine ingredients into a finished dish.
   - In KajBazar, **PostgreSQL** is the database management engine. It knows how to search through 100,000 service providers in 2 milliseconds using indexed B-trees.

4. **The Cold Storage / Walk-In Fridge (Physical Disk Storage)**:
   - If the restaurant loses power, the raw food does not magically vanish because it is physically locked inside heavy steel refrigerators on solid ground.
   - In computer terms, this is **Non-Volatile Storage (SSD/NVMe)**. Even if your computer restarts or crashes, PostgreSQL ensures that all user accounts, phone numbers, and reviews are permanently recorded on disk in Write-Ahead Log (WAL) files.

---

### 1.2 What is a Client (The Browser, DOM, and React.js)?

When you double-click Google Chrome or Safari, you are launching an application called a **Web Browser**. But what does a browser actually do?

A browser is essentially a rendering engine and JavaScript execution machine:
1. It downloads text files over the network: HTML (HyperText Markup Language), CSS (Cascading Style Sheets), and JS (JavaScript).
2. It parses HTML into a tree structure of memory objects called the **Document Object Model (DOM)**. For example:
   ```html
   <div>
     <h1>Welcome to KajBazar</h1>
     <button>Find an Electrician</button>
   </div>
   ```
3. It paints those objects onto your physical computer monitor as colored pixels.
4. When a user clicks a button, JavaScript catches that hardware click event and decides what to do next.

#### Why React.js Instead of Plain Vanilla JavaScript?
In older websites built with plain JavaScript, if a customer changed their search filter from "Plumber" to "Electrician", the programmer had to manually write code to delete 50 HTML elements from the screen and create 50 new HTML elements one by one. This was slow, error-prone, and caused screen flickering.

**React.js** solves this using a brilliant concept called the **Virtual DOM**:
- React keeps an imaginary, lightweight copy of the webpage in computer memory.
- When data changes (for example, 5 new electricians arrive from the server), React compares the old virtual tree with the new virtual tree (a process called *Reconciliation* or *Diffing*).
- React calculates the absolute minimum number of real pixels that need to change on the monitor and updates only those exact pixels in microseconds.
- This creates the silky-smooth, instant-loading feeling of modern web applications.

---

### 1.3 What is a Server (ASP.NET Core 8 Kestrel Web API)?

A **Server** sounds like a mysterious black box in a science fiction movie, but in reality:
> **A server is simply a regular computer program that runs continuously in an infinite loop, listening on a specific network port for incoming messages from other computers.**

In KajBazar, our server program is written in **C#** and runs on top of **.NET 8** using an ultra-high-performance web server component called **Kestrel**.

When Kestrel starts up on your computer, it tells the Linux or Windows operating system:
> *"Hey Operating System! Please reserve Port 5000 for me. Whenever any network packet arrives at this computer addressed to Port 5000, do not drop it. Wake me up and hand that packet directly to my process!"*

Kestrel can process over **1,000,000 requests per second** per server node because .NET 8 compiles C# into highly optimized native machine code using a Just-In-Time (JIT) compiler.

---

### 1.4 What is a Database (PostgreSQL Relational Storage)?

Why can't we just store all our user accounts and worker profiles in a simple `.txt` or `.json` file on our computer?

Imagine if 500 customers all clicked *"Submit Review"* at the exact same millisecond:
1. Customer A opens `reviews.txt` to append a review.
2. Customer B opens `reviews.txt` at the exact same moment.
3. Customer A saves their file, overwriting the file.
4. Customer B saves their file, completely wiping out Customer A's review! This disaster is called a **Race Condition** or **Write Conflict**.
5. Furthermore, searching a text file with 1,000,000 rows for *"electricians in Dumki"* would require reading every single letter from start to finish (a Full Table Scan), freezing your computer for 30 seconds.

A **Relational Database Management System (RDBMS)** like **PostgreSQL** solves all of these problems through mathematical guarantees known as **ACID**:
- **Atomicity (All or Nothing)**: If an operation involves multiple steps (e.g., deducting payment and creating a job ticket), either all steps succeed together, or if one fails, the entire transaction rolls back as if nothing ever happened.
- **Consistency**: The database enforces strict rules. A phone number must match the Bangladeshi mobile pattern (`^01[3-9]\d{8}$`). A review rating must be between 1 and 5. You cannot insert a review for a worker that does not exist.
- **Isolation**: 10,000 users can read and write at the exact same moment without corrupting each other's data. PostgreSQL uses **Multi-Version Concurrency Control (MVCC)** so readers never block writers, and writers never block readers.
- **Durability**: Once PostgreSQL says *"Saved"*, the data is committed to non-volatile disk logs (WAL). Even if someone unplugs the computer power cable a microsecond later, no data is lost upon reboot.

---

### 1.5 What is HTTP and JSON (The Universal Language of the Web)?

When your browser (React) talks to your server (ASP.NET Core), how do they communicate? They speak a protocol called **HTTP (HyperText Transfer Protocol)**.

An HTTP request is nothing more than plain English text formatted in a specific pattern sent over a network cable.

#### Anatomy of an HTTP Request:
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json
User-Agent: Mozilla/5.0 (Chrome/120.0)
Content-Length: 58

{
  "identifier": "01711223344",
  "password": "Password123#"
}
```

Let us decode every line:
1. `POST`: The HTTP **Verb** (Method). Tells the server what action we want to perform:
   - `GET`: "Please give me data" (e.g., fetch list of plumbers).
   - `POST`: "Please create new data" (e.g., register a user, submit a review).
   - `PUT` / `PATCH`: "Please update existing data" (e.g., update phone number).
   - `DELETE`: "Please remove data" (e.g., delete a spam review).
2. `/api/auth/login`: The **URL Path** (Route). Tells the server which exact door to knock on.
3. `Host: localhost:5000`: Where the server lives.
4. `Content-Type: application/json`: Tells the server that the payload inside the envelope is formatted in JSON.
5. `{ "identifier": "...", "password": "..." }`: The **Request Body** (Payload).

#### What is JSON?
**JSON (JavaScript Object Notation)** is a universal text format for representing structured data:
- Objects are enclosed in curly braces `{}`.
- Lists/arrays are enclosed in square brackets `[]`.
- Data is stored in key-value pairs: `"key": "value"`.
- It is human-readable, lightweight, and supported by every programming language on Earth (C#, Python, JavaScript, Go, Rust, Java).

---

### 1.6 What is an Operating System Process, Thread, and Network Port?

To understand how software runs on your computer, you must understand three core OS concepts:

1. **Process**:
   - A process is an instance of a computer program executing in its own isolated memory sandbox.
   - When you run `dotnet run`, your operating system assigns it a unique **PID (Process ID)**, such as `PID 48291`, and gives it a dedicated slice of RAM. Process A cannot spy on or modify Process B's memory.

2. **Thread**:
   - A thread is a worker inside a process. A single process can have dozens or hundreds of threads running concurrently across multiple CPU cores.
   - When 50 customers make requests to KajBazar at the exact same moment, .NET uses a **Thread Pool** to assign a thread to each customer simultaneously.

3. **Network Port**:
   - Imagine your computer is a massive apartment building with an address (IP Address: `127.0.0.1`).
   - The apartment building has 65,535 separate apartment doors, called **Ports**.
   - Port 5432 is where Mr. PostgreSQL lives.
   - Port 5000 is where Ms. ASP.NET Core Kestrel lives.
   - Port 5173 is where Mr. Vite Development Server lives.
   - When network packets arrive at your computer, the port number tells the operating system which exact apartment door to deliver the letter to.

---

### 1.7 How the Internet Moves Packets: DNS, IP Addresses, TCP Handshakes, and Sockets

When you type `http://localhost:5173` into your browser, what actually happens physically inside your computer?

```
[Browser: Chrome] 
       │ 
       ▼ (1) Resolves "localhost" to IP 127.0.0.1 (Loopback Adapter)
[Network Stack: TCP/IP]
       │
       ▼ (2) SYN Packet (Hey Port 5000, can we talk?)
[Kestrel: Port 5000]
       │
       ▼ (3) SYN-ACK Packet (Yes, I am ready! Here is my acknowledgement.)
[Browser: Chrome]
       │
       ▼ (4) ACK Packet (Great! Connection established. Here is my HTTP GET request.)
[Established TCP Socket]
```

1. **DNS / Host Resolution**: The browser checks `/etc/hosts` or DNS to convert a human name (`localhost` or `kajbazar.com`) into a machine IP address (`127.0.0.1` or `159.65.130.45`).
2. **TCP 3-Way Handshake**: Computers do not just blurt out data into the wire. They establish a guaranteed, reliable connection using the SYN -> SYN-ACK -> ACK handshake. If any packet gets lost on noisy Wi-Fi, TCP automatically resends it until verified.
3. **Socket Stream**: Once connected, an open pipe (a network socket) is created between the browser process and the Kestrel process, allowing high-speed two-way data streaming.

---

## 2. High-Level Architecture of KajBazar

Now that you have the mental model of clients, servers, and databases, let us inspect the architectural blueprint of **KajBazar**.

### 2.1 The 3-Tier Layered Architecture

KajBazar is built on the industry-standard **3-Tier Layered Architecture**:

```
+-----------------------------------------------------------------------------------+
|                            TIER 1: PRESENTATION LAYER                             |
|                                                                                   |
|   Technology: React 18, Vite, React Router, Axios, Pure Modern CSS               |
|   Location:   client/                                                             |
|   Role:       Renders UI, handles user input, executes client-side validation,    |
|               manages JWT session state in browser localStorage.                  |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ HTTPS / JSON REST API Calls
                                         ▼
+-----------------------------------------------------------------------------------+
|                            TIER 2: APPLICATION & API LAYER                        |
|                                                                                   |
|   Technology: ASP.NET Core 8 Web API, C# 12, Kestrel, JWT Bearer, BCrypt         |
|   Location:   src/KajBazar.API & src/KajBazar.Core & src/KajBazar.Infrastructure |
|   Role:       Authenticates users, authorizes roles (Admin/Worker/Customer),      |
|               enforces business logic (Rule BR-06), orchestrates repositories.    |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ SQL Queries over TCP (Port 5432)
                                         ▼
+-----------------------------------------------------------------------------------+
|                            TIER 3: DATA PERSISTENCE LAYER                         |
|                                                                                   |
|   Technology: PostgreSQL 15+, PL/pgSQL Triggers, Foreign Keys, B-Tree Indexes     |
|   Location:   sql/ & Physical Database Storage (kajbazar_db)                      |
|   Role:       Stores 12 normalized relational tables, maintains ACID guarantees,  |
|               executes rating calculation trigger on review mutations.            |
+-----------------------------------------------------------------------------------+
```

---

### 2.2 Why We Divided the Backend into 3 C# Projects (Clean Architecture / Onion Model)

If you inspect the `src/` directory of KajBazar, you will notice that the backend is not a single giant folder of code. It is cleanly partitioned into three separate C# projects:

```
src/
├── KajBazar.Core/             <-- The Heart (Domain Entities, Interfaces, DTOs)
├── KajBazar.Infrastructure/   <-- The Muscles (DbContext, SQL Repositories, BCrypt)
└── KajBazar.API/              <-- The Face (Controllers, Middleware, HTTP Pipeline)
```

Why did we do this instead of putting everything into one project?

Imagine you are building an expensive house:
- If you weld the plumbing pipes directly into the brick foundation, and 5 years later a pipe leaks, you have to bulldoze the entire house to replace a pipe!
- In software, if your database code is tangled inside your web controllers, you cannot upgrade your database, change your framework, or test your business rules without breaking everything.

This separation follows the famous **Clean Architecture (Onion Architecture)** principles invented by Robert C. Martin ("Uncle Bob"):

```
           +---------------------------------------------------------+
           |                      KajBazar.API                       |
           |             (Controllers, Middlewares, HTTP)            |
           |                            │                            |
           |                            ▼                            |
           |             +-----------------------------+             |
           |             |   KajBazar.Infrastructure   |             |
           |             | (DbContext, SQL, Repos, JWT)|             |
           |             |              │              |             |
           |             |              ▼              |             |
           |             |     +-----------------+     |             |
           |             |     |  KajBazar.Core  |     |             |
           |             |     | (Entities, DTOs)|     |             |
           |             |     +-----------------+     |             |
           |             +-----------------------------+             |
           +---------------------------------------------------------+
```

1. **`KajBazar.Core` (The Center of the Universe)**:
   - Contains pure business concepts: what is a `User`? What is a `ServiceProviderProfile`? What is a `Review`?
   - Contains repository contracts (interfaces): `IUserRepository`, `IReviewRepository`.
   - **Crucial Rule**: `KajBazar.Core` has **ZERO** dependencies on external libraries or databases! It does not know PostgreSQL exists. It does not know HTTP exists. It is pure, timeless C# domain logic.

2. **`KajBazar.Infrastructure` (The Outside World Adapter)**:
   - Contains the actual implementation of the database logic using **Entity Framework Core** and **Npgsql**.
   - Contains `KajBazarDbContext`, `UserRepository`, `ReviewRepository`, and `AuthService` (which hashes passwords with BCrypt and creates JWT tokens).
   - References `KajBazar.Core`.

3. **`KajBazar.API` (The Presentation & Entrypoint)**:
   - Contains the HTTP controllers (`AuthController`, `WorkersController`, `ReviewsController`), configuration files (`appsettings.json`), and `Program.cs`.
   - References both `KajBazar.Core` and `KajBazar.Infrastructure` so it can register dependencies and boot up the web server.

---

### 2.3 The Dependency Inversion Principle Explained Simply

The **Dependency Inversion Principle (DIP)** is the "D" in the famous **SOLID** principles of object-oriented design.

It states:
> *High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).*

#### The Physical Analogy: The Electric Wall Socket
In your bedroom, you have a 3-pin electrical wall socket.
- The wall socket does not care whether you plug in a Samsung smartphone charger, a Dyson vacuum cleaner, or a Sony PlayStation 5.
- The wall socket defines an **Interface** (delivers 220V AC power through 3 prongs).
- Any appliance that implements that 3-pin plug interface will work seamlessly.
- You do not need to rewire your house's electrical panel every time you buy a new phone!

#### In KajBazar:
Our `WorkersController` needs to fetch verified workers.
- Instead of talking directly to PostgreSQL or writing raw SQL queries inside the controller, the controller only asks for `IServiceProviderRepository`:
  ```csharp
  // The Controller depends ONLY on the abstract interface (the wall socket)
  public class WorkersController : ControllerBase
  {
      private readonly IServiceProviderRepository _workerRepo;

      public WorkersController(IServiceProviderRepository workerRepo)
      {
          _workerRepo = workerRepo;
      }
  }
  ```
- If tomorrow we decide to switch from PostgreSQL to MongoDB or Amazon DynamoDB, we only write a new repository class that implements `IServiceProviderRepository`. **The controller code does not change by a single comma!**

---

### 2.4 Separation of Concerns: The Golden Rule of Maintainable Systems

Every file in KajBazar has **one single job** (Single Responsibility Principle):
- **Entities** (`User.cs`, `Review.cs`): Define the shape of data in memory.
- **DTOs** (`RegisterRequestDto.cs`, `WorkerSummaryDto.cs`): Define what data travels over the network wire.
- **Interfaces** (`IReviewRepository.cs`): Define what operations are possible without worrying about how they are executed.
- **Repositories** (`ReviewRepository.cs`): Execute the actual SQL/LINQ queries against the database.
- **Controllers** (`ReviewsController.cs`): Receive HTTP requests, check authorization headers, call repositories, and return HTTP status codes.
- **Middleware** (`ExceptionHandlingMiddleware.cs`): Catches unexpected crashes across the entire app and formats friendly error messages.

---

### 2.5 ASCII Architecture Blueprint of the Entire System

Here is the complete birds-eye architectural blueprint showing how all components interact:

```
+===================================================================================================+
|                                    KAJBAZAR SYSTEM ARCHITECTURE                                   |
+===================================================================================================+

  [ WEB BROWSER: DESKTOP OR MOBILE ]
                 │
                 │ 1. User interacts with UI (Clicks "Find Plumber" or "Call Worker")
                 ▼
  [ REACT 18 SPA FRONTEND ] (Vite Dev Server :5173 / Nginx Production :80/:443)
  ├── Global State: AuthContext (Token, User Profile, Role: Customer/Worker/Admin)
  ├── Routing: react-router-dom (/workers, /profile/:id, /recommend, /admin)
  ├── API Client: Axios Client with Interceptors (Injects 'Authorization: Bearer <token>')
  └── UI Components: WorkerCard (Rule BR-06), WorkerFilter, DetailModal, AdminDashboard
                 │
                 │ 2. HTTP/1.1 REST Request over TCP Socket (JSON Payload)
                 ▼
  [ KESTREL WEB SERVER (ASP.NET CORE 8) ] (:5000)
  ├── Exception Handling Middleware (Translates unhandled bugs into RFC 7807 Problem Details)
  ├── CORS Middleware (Allows React at localhost:5173 to communicate safely)
  ├── Routing Middleware (Directs /api/workers?districtId=1 to WorkersController.Search())
  ├── Authentication Middleware (Decodes JWT token signature using HMAC-SHA256 Secret)
  └── Authorization Middleware (Enforces [Authorize(Roles = "admin")] policies)
                 │
                 │ 3. Method Invocation via Dependency Injection
                 ▼
  [ CONTROLLER LAYER (KajBazar.API) ]
  ├── AuthController           ──> Register, Login, Token Refresh
  ├── WorkersController        ──> Search, Filter, Profile, Reveal Phone (BR-06)
  ├── ReviewsController        ──> Submit Rating (1-5), Prevent Duplicates
  ├── RecommendationsController──> Submit Community Worker, Admin Approval
  ├── AdminController          ──> Moderation, Verification, Audit Logs
  ├── CategoriesController     ──> CRUD Categories (Electrician, Plumber, etc.)
  └── GeographyController      ──> Districts & Upazilas Lookup
                 │
                 │ 4. Invokes Repository Contracts (Domain Interfaces)
                 ▼
  [ INFRASTRUCTURE LAYER (KajBazar.Infrastructure) ]
  ├── KajBazarDbContext (EF Core 8 Object-Relational Mapper)
  │   ├── Snake_case naming convention translator
  │   ├── PostgreSQL Enum type converters (user_role, verification_status)
  │   └── Relationship mappings (HasMany, HasOne, OnDelete Restrict)
  ├── Repositories (Npgsql Execution Engine)
  └── Security Services (BCrypt Password Hasher, JWT Token Generator)
                 │
                 │ 5. Parameterized SQL Queries & Transactions (Port 5432)
                 ▼
  [ POSTGRESQL 15+ RELATIONAL DATABASE (kajbazar_db) ]
  ├── 12 Relational Tables (users, roles, profiles, categories, reviews, audit_logs...)
  ├── Foreign Key Constraints & Check Constraints (Regex for BD phone: ^01[3-9]\d{8}$)
  ├── B-Tree Indexes (Fast lookups on worker status, category, location)
  └── PL/pgSQL Trigger (trg_update_worker_rating_stats: auto-recalculates average rating)
```

---

## 3. Prerequisites & Machine Setup

Let us now prepare your physical computer so that you can compile and run KajBazar without any errors.

### 3.1 Hardware, RAM, CPU, and Disk Space Requirements

KajBazar is designed to be lightweight, efficient, and capable of running on modest development machines:

| Hardware Component | Minimum Requirement | Recommended Specification |
|:---|:---|:---|
| **CPU** | Dual-core 2.0 GHz (x86_64 or ARM64) | Quad-core Intel Core i5 / AMD Ryzen 5 / Apple M1+ |
| **RAM** | 4 GB | 8 GB or 16 GB |
| **Disk Storage** | 5 GB free space | 15 GB free space (SSD preferred) |
| **Operating System**| Ubuntu 20.04+, Debian 11+, macOS 12+, Windows 10/11 | Ubuntu 22.04 / 24.04 LTS or Arch Linux |

---

### 3.2 Operating System Guides (Ubuntu/Debian Linux, macOS, and Windows 11)

#### For Ubuntu / Debian Linux:
Update your package index first:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https lsb-release build-essential
```

#### For macOS:
Install the Homebrew package manager if you haven't already:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### For Windows 11:
We strongly recommend using **Windows Subsystem for Linux 2 (WSL2)** running Ubuntu 22.04:
```powershell
# Run in Windows PowerShell as Administrator:
wsl --install -d Ubuntu-22.04
```
Once installed, open your Ubuntu terminal and follow the Linux instructions.

---

### 3.3 Installing and Configuring Git

Git is the distributed version control system that tracks every line of code change:

```bash
# Ubuntu / Debian
sudo apt install -y git

# macOS
brew install git

# Verify installation
git --version
# Expected output: git version 2.34.1 or higher
```

Now configure your global developer identity (replace with your real name and email):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

---

### 3.4 Installing .NET 8 SDK (SDK vs Runtime vs CLI)

It is crucial to understand the difference between the **.NET Runtime** and the **.NET SDK**:
- **.NET Runtime**: Only allows you to *run* pre-compiled `.dll` applications. It does NOT have a compiler!
- **.NET SDK (Software Development Kit)**: Contains the C# compiler (`csc`), the build system (MSBuild), the CLI tool (`dotnet`), template generators, and the runtime. **You must install the SDK to develop KajBazar.**

#### Installing .NET 8 SDK on Ubuntu/Debian:
```bash
# Register Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install .NET 8 SDK
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Verify installation
dotnet --info
```
You should see output similar to:
```text
.NET SDK:
 Version:           8.0.404
 Commit:            0ec2f47285

Runtime Environment:
 OS Name:           ubuntu
 OS Version:        22.04
 Base Path:         /usr/lib/dotnet/sdk/8.0.404/
```

*Note: If your machine has multiple .NET SDK versions installed (e.g. .NET 10 preview and .NET 8), always ensure `dotnet --list-sdks` shows `8.0.xxx`. You can target a specific SDK using a `global.json` file if needed.*

---

### 3.5 Installing Node.js & npm (Using NVM for Version Control)

Node.js is the JavaScript runtime that executes our frontend build tools. We strongly recommend using **NVM (Node Version Manager)** to install Node.js because it avoids permissions issues with `sudo npm`:

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Activate NVM in current shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20 LTS (Long Term Support)
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node -v
# Expected: v20.18.0 or higher
npm -v
# Expected: 10.8.2 or higher
```

---

### 3.6 Installing and Securing PostgreSQL 15+

PostgreSQL is our relational database engine:

```bash
# Ubuntu / Debian
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service on boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
# Expected: Active: active (running)
```

Now, configure the default `postgres` superuser password so our application can connect:
```bash
# Set password for postgres system user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

Verify that you can connect to the database command line:
```bash
psql -U postgres -h localhost -c "SELECT version();"
```
You should see:
```text
                                                 version                                                  
----------------------------------------------------------------------------------------------------------
 PostgreSQL 16.3 (Ubuntu 16.3-1.pgdg22.04+1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0) ...
```

---

### 3.7 Recommended Developer Tooling

To maximize your developer productivity, install the following recommended tools:

1. **Visual Studio Code (VS Code)**:
   - Free, lightweight, and modern code editor.
   - Recommended Extensions:
     - *C# Dev Kit* (by Microsoft)
     - *Tailwind CSS IntelliSense* / *Modern CSS*
     - *PostgreSQL* (by Chris Kolkman)
     - *GitLens* (for visual git history)
2. **Postman or Thunder Client**:
   - For testing HTTP REST endpoints interactively.
3. **curl & jq**:
   - Standard command-line tools for firing HTTP requests and formatting JSON responses.

---

## 4. Step-by-Step Construction from an Empty Directory

Now comes the fun part! Imagine you are sitting in front of a completely blank directory called `Kajbazar`. Here is the exact command-by-command recipe to construct the entire project from scratch.

### 4.1 Step 1: Initialize the Root Folder and Git Repository

Open your terminal:
```bash
mkdir Kajbazar
cd Kajbazar
git init
```

Create the standard `.gitignore` file to ensure build artifacts and temporary files are never accidentally committed to Git:
```bash
cat << 'EOF' > .gitignore
## .NET Core build artifacts
bin/
obj/
*.user
*.suo
.vscode/
.idea/

## Node.js frontend artifacts
node_modules/
dist/
.vite/
npm-debug.log*

## Environment secrets
.env
.env.local
*.pfx
*.pem

## Database files
*.db
*.sqlite
EOF
```

Commit the initial configuration:
```bash
git add .gitignore
git commit -m "chore: initialize repository and gitignore"
```

---

### 4.2 Step 2: Create the .NET Solution and 4 Project Libraries

A **Solution (`.sln`)** is a master container that groups multiple C# projects together so they can be compiled and tested with a single command.

Execute these commands in the project root:

```bash
# 1. Create the master solution file
dotnet new sln -n KajBazar

# 2. Create the Domain Core class library (net8.0)
dotnet new classlib -n KajBazar.Core -o src/KajBazar.Core -f net8.0

# 3. Create the Infrastructure class library (net8.0)
dotnet new classlib -n KajBazar.Infrastructure -o src/KajBazar.Infrastructure -f net8.0

# 4. Create the Web API project (net8.0)
dotnet new webapi -n KajBazar.API -o src/KajBazar.API -f net8.0 --no-openapi

# 5. Create the xUnit Automated Test project (net8.0)
dotnet new xunit -n KajBazar.Tests -o tests/KajBazar.Tests -f net8.0

# 6. Add all 4 projects to the master solution
dotnet sln KajBazar.sln add src/KajBazar.Core/KajBazar.Core.csproj
dotnet sln KajBazar.sln add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj
dotnet sln KajBazar.sln add src/KajBazar.API/KajBazar.API.csproj
dotnet sln KajBazar.sln add tests/KajBazar.Tests/KajBazar.Tests.csproj

# 7. Remove default template boilerplate files
rm src/KajBazar.Core/Class1.cs
rm src/KajBazar.Infrastructure/Class1.cs
rm tests/KajBazar.Tests/UnitTest1.cs
```

---

### 4.3 Step 3: Wire Up Project References (Inter-Project Dependencies)

Now we connect the projects following our Clean Architecture rules:
1. `KajBazar.Infrastructure` must reference `KajBazar.Core`.
2. `KajBazar.API` must reference both `KajBazar.Core` and `KajBazar.Infrastructure`.
3. `KajBazar.Tests` must reference all three projects so it can test any component.

```bash
# Infrastructure references Core
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj reference src/KajBazar.Core/KajBazar.Core.csproj

# API references Core and Infrastructure
dotnet add src/KajBazar.API/KajBazar.API.csproj reference src/KajBazar.Core/KajBazar.Core.csproj
dotnet add src/KajBazar.API/KajBazar.API.csproj reference src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj

# Tests reference all three projects
dotnet add tests/KajBazar.Tests/KajBazar.Tests.csproj reference src/KajBazar.Core/KajBazar.Core.csproj
dotnet add tests/KajBazar.Tests/KajBazar.Tests.csproj reference src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj
dotnet add tests/KajBazar.Tests/KajBazar.Tests.csproj reference src/KajBazar.API/KajBazar.API.csproj
```

---

### 4.4 Step 4: Install Required NuGet Packages

**NuGet** is the official package manager for .NET (analogous to `npm` for JavaScript or `pip` for Python). We need specific libraries to communicate with PostgreSQL, generate JWT tokens, hash passwords, and generate Swagger documentation.

```bash
# Core packages (BCrypt password hasher)
dotnet add src/KajBazar.Core/KajBazar.Core.csproj package BCrypt.Net-Next --version 4.0.3

# Infrastructure packages (EF Core, Npgsql PostgreSQL Provider, Snake Case Naming)
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.4
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj package EFCore.NamingConventions --version 8.0.3
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj package Microsoft.EntityFrameworkCore --version 8.0.8
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.8

# API packages (Swagger / OpenAPI Documentation Generator)
dotnet add src/KajBazar.API/KajBazar.API.csproj package Swashbuckle.AspNetCore --version 6.6.2
dotnet add src/KajBazar.API/KajBazar.API.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.8

# Test packages (In-Memory Database for fast, zero-dependency unit tests)
dotnet add tests/KajBazar.Tests/KajBazar.Tests.csproj package Microsoft.EntityFrameworkCore.InMemory --version 8.0.8
```

Verify that the entire solution builds cleanly:
```bash
dotnet build KajBazar.sln
# Expected: Build succeeded. 0 Warning(s), 0 Error(s).
```

---

### 4.5 Step 5: Initialize the Frontend Application with Vite & React

Now let us build the frontend client using **Vite** (pronounced *"veet"*, the French word for "fast"). Vite is 10 to 50 times faster than the old `create-react-app` tool because it leverages native ES modules in modern browsers.

In the project root:
```bash
# Create client directory using Vite React template
npm create vite@latest client -- --template react

cd client
npm install
```

---

### 4.6 Step 6: Install Frontend npm Packages

We need three essential packages for our React frontend:
1. `axios`: For making HTTP requests to our ASP.NET Core backend.
2. `react-router-dom`: For multi-page navigation without full browser reloads.
3. `lucide-react`: For clean, modern SVG icons (stars, shield badges, phone icons).

```bash
cd client
npm install axios react-router-dom lucide-react
cd ..
```

Verify that the frontend builds cleanly into static HTML/JS:
```bash
cd client
npm run build
cd ..
# Expected: vite v5.x.x building for production... dist/index.html generated!
```

---

### 4.7 Step 7: Create the Database SQL Scripts Directory

Create a dedicated `sql/` folder in the root to store all our raw SQL scripts:
```bash
mkdir -p sql
```
We will place 4 master SQL files inside this folder:
- `sql/01_schema_ddl.sql`: Creates all 12 tables, indexes, constraints, and the rating recalculation trigger.
- `sql/02_seed_data.sql`: Seeds roles, districts, upazilas, categories, test users, and verified workers with BCrypt hashes.
- `sql/03_crud_queries.sql`: Contains operational CRUD queries for testing.
- `sql/04_complex_queries.sql`: Contains 15 advanced analytical queries (window functions, rankings, aggregations).

---

### 4.8 Step 8: Initialize Documentation and Diagrams

A professional project always maintains comprehensive documentation and architecture diagrams:
```bash
mkdir -p docs/development-guide
mkdir -p docs/diagrams
```

Now let us commit our scaffolded project structure:
```bash
git add .
git commit -m "feat: complete scaffolding of backend, frontend, database, and docs"
```

---

## 5. Deep Dive into the Solution Files and `.csproj` XML

Let us inspect the exact configuration files that tell the compiler how to build our software.

### 5.1 Understanding `KajBazar.sln` Line-by-Line

When you open `KajBazar.sln` in a text editor, you see:
```text
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "KajBazar.Core", "src\KajBazar.Core\KajBazar.Core.csproj", "{47424C58-00C8-4DE3-BCF3-BFECEBE8AC31}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "KajBazar.Infrastructure", "src\KajBazar.Infrastructure\KajBazar.Infrastructure.csproj", "{6A0A9D21-F3B2-4E90-A6E5-B9F25091BCF2}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "KajBazar.API", "src\KajBazar.API\KajBazar.API.csproj", "{986C8D12-3B45-42E1-A65E-D2B12389CFE3}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "KajBazar.Tests", "tests\KajBazar.Tests\KajBazar.Tests.csproj", "{3B8A7D91-E2F4-41A8-98C3-B4A1D2E5C9A1}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
...
```

- `Microsoft Visual Studio Solution File`: Identifies the solution header format.
- `Project("{FAE04EC0-301F...}")`: A unique GUID that identifies the project type (C# project).
- `"KajBazar.Core"`: The human-readable name of the project.
- `"src\KajBazar.Core\KajBazar.Core.csproj"`: The relative file path to the project definition.
- `"{47424C58-00C8...}"`: A unique GUID assigned to this specific project so the build engine can track dependency graphs.

---

### 5.2 Anatomy of `KajBazar.Core.csproj` Line-by-Line

Let us look inside `src/KajBazar.Core/KajBazar.Core.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
  </ItemGroup>

</Project>
```

- `<Project Sdk="Microsoft.NET.Sdk">`: Tells MSBuild to use the modern, lightweight .NET Core SDK build rules rather than the old legacy .NET Framework 4.8 rules.
- `<TargetFramework>net8.0</TargetFramework>`: Tells the C# compiler to target **.NET 8.0 Long Term Support (LTS)**. This unlocks modern C# 12 language features like primary constructors and collection expressions.
- `<ImplicitUsings>enable</ImplicitUsings>`: Automatically imports standard namespaces like `System`, `System.Collections.Generic`, `System.Linq`, and `System.Threading.Tasks` in every file so you don't have to write 15 `using` statements at the top of every single file.
- `<Nullable>enable</Nullable>`: Turns on C#'s **Nullable Reference Types** feature. If a variable might be null, you must explicitly declare it with a question mark (e.g. `string? bio`). If you forget to check for null, the compiler warns you at build time, preventing dreaded `NullReferenceException` crashes!
- `<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />`: Pulls in the battle-tested BCrypt hashing algorithm for securely hashing passwords before storing them.

---

### 5.3 Anatomy of `KajBazar.Infrastructure.csproj` Line-by-Line

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\KajBazar.Core\KajBazar.Core.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="EFCore.NamingConventions" Version="8.0.3" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.8" />
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.4" />
  </ItemGroup>

</Project>
```

- `<ProjectReference Include="..\KajBazar.Core\KajBazar.Core.csproj" />`: Gives Infrastructure direct access to all Entities, DTOs, and Interfaces defined in Core.
- `Npgsql.EntityFrameworkCore.PostgreSQL`: The official open-source database driver that connects Entity Framework Core directly to PostgreSQL.
- `EFCore.NamingConventions`: Automatically converts C# PascalCase names (`ServiceProviderProfile`) to PostgreSQL snake_case names (`service_provider_profiles`).

---

### 5.4 Anatomy of `KajBazar.API.csproj` Line-by-Line

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\KajBazar.Core\KajBazar.Core.csproj" />
    <ProjectReference Include="..\KajBazar.Infrastructure\KajBazar.Infrastructure.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
  </ItemGroup>

</Project>
```

- `<Project Sdk="Microsoft.NET.Sdk.Web">`: Notice `.Web` at the end! This tells MSBuild that this project is an executable web server application containing Kestrel, routing, and controller middleware.
- `Swashbuckle.AspNetCore`: Automatically inspects our C# controllers and generates an interactive Swagger web page at `/swagger` where developers can test every API endpoint in their browser.

---

### 5.5 Anatomy of `KajBazar.Tests.csproj` Line-by-Line

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="coverlet.collector" Version="6.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.8" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.5.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.3" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\KajBazar.API\KajBazar.API.csproj" />
    <ProjectReference Include="..\..\src\KajBazar.Core\KajBazar.Core.csproj" />
    <ProjectReference Include="..\..\src\KajBazar.Infrastructure\KajBazar.Infrastructure.csproj" />
  </ItemGroup>

</Project>
```

- `Microsoft.EntityFrameworkCore.InMemory`: Allows our automated tests to spin up an ephemeral, blazing-fast database entirely in RAM in 10 milliseconds without needing a real PostgreSQL instance running.
- `xunit`: The premier unit testing framework for .NET.

---

### 5.6 Anatomy of `client/package.json` Line-by-Line

Now let us examine the frontend configuration file:

```json
{
  "name": "client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "vite": "^5.4.8"
  }
}
```

- `"type": "module"`: Enables modern ECMAScript Module (ESM) syntax (`import ... from ...` instead of `require(...)`).
- `"scripts"`:
  - `npm run dev`: Starts the local development server with Hot Module Replacement (HMR). When you edit a `.jsx` file, the browser updates instantly without a page refresh!
  - `npm run build`: Compiles, minifies, and bundles all React components into ultra-compact JavaScript and CSS files in `client/dist/`.
- `"dependencies"`: Libraries required at runtime by the user's browser.
- `"devDependencies"`: Libraries only used on your machine during development and compilation.

---

### 5.7 Anatomy of `client/vite.config.js` Line-by-Line

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

- `plugins: [react()]`: Teaches Vite how to compile JSX syntax (HTML inside JavaScript) into pure JavaScript function calls (`React.createElement`).
- `port: 5173`: Forces the Vite development server to run on port 5173.
- `proxy`: A developer lifesaver! Whenever React code makes a request to `/api/...`, Vite forwards it behind the scenes to `http://localhost:5000` (our ASP.NET Core backend). This completely eliminates CORS (Cross-Origin Resource Sharing) headaches during local development!

---

### 5.8 Anatomy of `.gitignore` Line-by-Line

Let us inspect why every line in `.gitignore` is necessary:
- `bin/` and `obj/`: Temporary compiled binary outputs from MSBuild. They are machine-specific and can always be regenerated with `dotnet build`. Committing them bloats your Git repository with gigabytes of useless binary junk.
- `node_modules/`: Contains thousands of third-party JavaScript libraries downloaded by npm. It can exceed 300MB! Anyone can regenerate it instantly by running `npm install`.
- `dist/`: The compiled frontend production bundle. Regenerated via `npm run build`.
- `.env` / `*.pfx`: Secret environment variables, database passwords, and SSL private keys. **Never commit secrets to Git!**

---

## 6. Deep Dive into the Folder Structure and Every File

Let us view the complete file map of KajBazar:

### 6.1 Master Repository Tree Listing

```
KajBazar/
├── .gitignore
├── KajBazar.sln
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── index.jsx
│       ├── App.jsx
│       ├── styles/
│       │   └── App.css                 # Master modern design system stylesheet
│       ├── components/
│       │   ├── Navigation.jsx          # Responsive Navbar & SaaS Footer
│       │   ├── WorkerComponents.jsx    # WorkerCard, WorkerFilter, WorkerDetailModal
│       │   └── common/                 # Atomic UI component library
│       │       ├── index.js            # Barrel export
│       │       ├── Button.jsx          # Primary, secondary, outline, danger, loading
│       │       ├── Badge.jsx           # Verified, pending, rejected status pills
│       │       ├── Card.jsx            # Bordered surface container with hover elevation
│       │       ├── Modal.jsx           # Accessible dialog with backdrop blur & ESC handler
│       │       ├── ConfirmDialog.jsx   # Modern action confirmation replacing prompt()
│       │       ├── Input.jsx           # Accessible inputs, select, textarea, eye toggle
│       │       ├── RatingStars.jsx     # Display & interactive gold star ratings
│       │       ├── SkeletonLoader.jsx  # Shimmer loading cards, rows, and lines
│       │       └── EmptyState.jsx      # Friendly no-results state with action triggers
│       ├── context/
│       │   ├── AuthContext.jsx         # User session, role state & JWT token persistence
│       │   └── ToastContext.jsx        # Floating notifications (success, error, warning)
│       ├── pages/
│       │   ├── HomePage.jsx            # Hero search, trade categories, verified worker cards
│       │   ├── WorkerDirectoryPage.jsx # Multi-criteria search, filters, and pagination
│       │   ├── WorkerProfilePage.jsx   # Dual mode: public profile & worker dashboard
│       │   ├── RecommendWorkerPage.jsx # Offline worker referral form & history
│       │   ├── AuthAndAdminPages.jsx   # Login, Register, and Admin moderation dashboard
│       │   └── NotFoundPage.jsx        # 404 error page for unmatched routes
│       └── services/
│           └── api.js                  # Axios client with automatic Bearer token interceptor
├── docs/
│   ├── Class-diagrams.md
│   ├── Database-details.md
│   ├── Database-setup-and-integration.md
│   ├── Frontend-guide.md
│   ├── KajBazar_Project_Proposal_Formatted.md
│   ├── Project-running-and-publishing.md
│   ├── Testing-procedure.md
│   ├── walkthrough.md
│   ├── development-guide/
│   │   ├── README.md                                           # Master guide index
│   │   ├── 00-master-overview-and-table-of-contents.md
│   │   ├── 01-complete-architecture-and-build-from-scratch.md
│   │   ├── 02-database-guide-and-production-hardening.md
│   │   ├── 03-backend-aspnet-core-developer-guide.md
│   │   ├── 04-frontend-react-developer-guide.md
│   │   ├── 05-testing-guide-and-test-suites.md
│   │   ├── 06-deployment-and-devops-guide.md
│   │   ├── 07-troubleshooting-and-faq-guide.md
│   │   ├── 08-maintenance-and-evolution-guide.md
│   │   ├── 09-security-and-incident-response-guide.md
│   │   └── 10-performance-optimization-and-scaling-guide.md
│   └── diagrams/
│       ├── 01_context_diagram.mmd
│       ├── 02_dfd_level_0.mmd
│       ├── 03_dfd_level_1.mmd
│       ├── 04_dfd_level_2.mmd
│       ├── 05_use_case_diagram.mmd
│       ├── 06_activity_diagram_registration.mmd
│       ├── 07_activity_diagram_worker_verification.mmd
│       ├── 08_activity_diagram_search_and_contact.mmd
│       ├── 09_activity_diagram_review_submission.mmd
│       ├── 10_activity_diagram_recommendation.mmd
│       ├── 11_class_diagram_domain_model.mmd
│       ├── 12_class_diagram_architecture.mmd
│       ├── 13_er_diagram_conceptual.mmd
│       ├── 14_er_diagram_physical.mmd
│       ├── 15_sequence_diagrams.mmd
│       └── README.md
├── sql/
│   ├── 01_schema_ddl.sql               # 12 Tables, constraints, triggers, indexes
│   ├── 02_seed_data.sql                # Seed roles, districts, categories, test accounts
│   ├── 03_crud_queries.sql             # Operational CRUD test queries
│   └── 04_complex_queries.sql          # Analytical reporting & rating queries
├── src/
│   ├── KajBazar.API/
│   │   ├── KajBazar.API.csproj
│   │   ├── Program.cs                  # Pipeline, DI, JWT auth, Swagger, Health checks
│   │   ├── appsettings.json            # DB connection string, JWT keys, CORS config
│   │   ├── Controllers/
│   │   │   ├── AdminController.cs      # Moderation, stats, verification, audit trail
│   │   │   ├── AuthController.cs       # Register, login, current user (/api/auth/me)
│   │   │   ├── CategoriesController.cs # Public trade categories
│   │   │   ├── GeographyController.cs  # Districts and Upazilas
│   │   │   ├── RecommendationsController.cs # Offline referrals
│   │   │   ├── ReviewsController.cs    # Reviews and ratings
│   │   │   └── WorkersController.cs    # Worker search, profile details, provider updates
│   │   └── Middleware/
│   │       └── ExceptionHandlingMiddleware.cs # Global safe exception handler
│   ├── KajBazar.Core/
│   │   ├── KajBazar.Core.csproj
│   │   ├── DTOs/
│   │   │   ├── AdminDtos.cs
│   │   │   ├── AuthDtos.cs
│   │   │   ├── GeographyDtos.cs
│   │   │   ├── RecommendationDtos.cs
│   │   │   ├── ReviewDtos.cs
│   │   │   └── WorkerDtos.cs
│   │   ├── Entities/
│   │   │   ├── Category.cs
│   │   │   ├── GeographyEntities.cs    # District & Upazila
│   │   │   ├── InteractionEntities.cs  # Review, Recommendation, Report, AuditLog
│   │   │   ├── Role.cs
│   │   │   ├── ServiceProviderProfile.cs
│   │   │   └── User.cs
│   │   ├── Enums/
│   │   │   └── DomainEnums.cs          # VerificationStatus, RecommendationStatus
│   │   └── Interfaces/
│   │       └── RepositoryInterfaces.cs # IUserRepository, IServiceProviderRepository, etc.
│   └── KajBazar.Infrastructure/
│       ├── KajBazar.Infrastructure.csproj
│       ├── Data/
│       │   └── KajBazarDbContext.cs    # EF Core DbContext with snake_case naming
│       ├── Services/
│       │   └── AuthService.cs          # BCrypt password hashing & JWT generation
│       └── Repositories/
│           ├── AdminAuditLogRepository.cs
│           ├── CategoryRepository.cs
│           ├── GeographyRepository.cs
│           ├── RecommendationRepository.cs
│           ├── ReviewRepository.cs
│           ├── ServiceProviderRepository.cs
│           └── UserRepository.cs
└── tests/
    └── KajBazar.Tests/
        ├── KajBazar.Tests.csproj
        ├── AdminAuditLogTests.cs
        ├── AuthTests.cs
        ├── RecommendationTests.cs
        ├── ReviewAndRatingTests.cs
        └── WorkerSearchAndProfileTests.cs
```

---

### 6.2 Detailed Explanation of Every Directory and File

#### Frontend Files (`client/`):
- `index.html`: The single HTML container page loaded by the browser. Contains `<div id="root"></div>` where React mounts.
- `src/index.jsx`: The JavaScript entrypoint that mounts `App.jsx` into the root DOM node.
- `src/App.jsx`: The top-level component defining application routing (`/`, `/directory`, `/workers/:id`, `/my-profile`, `/recommend`, `/admin`, `/login`, `/register`, `*`), `AuthProvider`, and `ToastProvider`.
- `src/styles/App.css`: Master modern design system stylesheet containing color tokens, typography scales, card layouts, modal styles, toast animations, and responsive media queries.
- `src/components/common/`: Reusable atomic UI component library (`Button`, `Badge`, `Card`, `Modal`, `ConfirmDialog`, `Input`, `RatingStars`, `SkeletonLoader`, `EmptyState`).
- `src/components/Navigation.jsx`: Responsive header with active route indicators, user role badges, mobile sliding drawer, and SaaS footer.
- `src/components/WorkerComponents.jsx`: Directory UI components (`WorkerCard`, `WorkerFilter`, `WorkerDetailModal`).
- `src/context/AuthContext.jsx`: Global authentication context managing login, register, JWT token persistence, and role state.
- `src/context/ToastContext.jsx`: Floating notification provider for non-intrusive feedback (`toast.success`, `toast.error`, etc.).
- `src/pages/HomePage.jsx`: Landing page featuring hero search, live platform statistics ribbon, popular trade category grid, and verified worker cards.
- `src/pages/WorkerDirectoryPage.jsx`: Filterable worker directory with URL query param sync, active filter pills, skeleton loaders, and pagination.
- `src/pages/WorkerProfilePage.jsx`: Dual-mode profile view: public profile display with direct call CTA and reviews, or private worker management dashboard.
- `src/pages/RecommendWorkerPage.jsx`: Offline worker referral form with Bangladeshi phone number validation and submission history list.
- `src/pages/AuthAndAdminPages.jsx`: Authentication (login with 1-click demo accounts, registration with role switcher) and admin dashboard (metrics, moderation tabs, and ConfirmDialog).
- `src/pages/NotFoundPage.jsx`: Modern 404 error page with navigation actions.
- `src/services/api.js`: Axios HTTP client with base URL configuration, request interceptor (attaches JWT Bearer token), and response interceptor (handles 401 unauthenticated errors).


#### Backend Core Files (`src/KajBazar.Core/`):
- `Entities/`: Pure C# classes representing database tables (`User`, `Role`, `ServiceProviderProfile`, `Category`, `District`, `Upazila`, `Review`, `CommunityRecommendation`, `Report`, `AdminAuditLog`).
- `Enums/`: Enumeration definitions (`UserRole`, `VerificationStatus`, `ReportStatus`, `RecommendationStatus`).
- `DTOs/`: Immutable record types used for network communication (`RegisterRequestDto`, `LoginRequestDto`, `WorkerSummaryDto`, `ReviewDto`, etc.).
- `Interfaces/`: Repository and service contracts defining application capabilities.

#### Backend Infrastructure Files (`src/KajBazar.Infrastructure/`):
- `Data/KajBazarDbContext.cs`: EF Core database context configuring PostgreSQL snake_case conventions, relationship cascades, and custom type mappings.
- `Repositories/`: Concrete implementations of domain interfaces executing optimized LINQ and SQL queries.
- `Services/AuthService.cs`: Implementation of JWT token generation and BCrypt password verification.

#### Backend API Files (`src/KajBazar.API/`):
- `Program.cs`: ASP.NET Core application entrypoint configuring dependency injection, middleware pipeline, JWT validation, CORS, and Swagger.
- `Controllers/`: 7 REST API controllers exposing HTTP endpoints.
- `Middleware/ExceptionHandlingMiddleware.cs`: Global exception handler returning RFC 7807 Problem Details.
- `appsettings.json`: Configuration file storing database connection strings and JWT signing secrets.

---

### 6.3 Configuration Files: `appsettings.json`, `appsettings.Development.json`, `launchSettings.json`

Let us inspect `src/KajBazar.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=kajbazar_db;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "KajBazarSuperSecretKeyForJwtSigningMustBeVeryLong2026!",
    "Issuer": "KajBazarAPI",
    "Audience": "KajBazarClient",
    "ExpiryMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

- `DefaultConnection`: The connection string telling Npgsql where PostgreSQL lives (`localhost:5432`), the database name (`kajbazar_db`), and credentials.
- `Jwt:Key`: The secret symmetric 256-bit key used to digitally sign JWT tokens. If an attacker guesses this key, they can forge admin tokens! In production, this is loaded from an environment variable.
- `Jwt:ExpiryMinutes`: 1440 minutes = 24 hours. Tokens expire after 24 hours, requiring the user to re-authenticate.

---

## 7. The Lifecycle of a Web Request: From User Click to Disk and Back

To truly understand full-stack software development, let us walk through the exact journey of a single user action:
> **A user opens KajBazar, selects "Patuakhali" -> "Dumki" -> "Electrician", and clicks "Search".**

Here is the exact step-by-step chronology across hardware, memory, and code:

```
[ STEP 1: USER CLICKS BUTTON ]
  │
  ▼
[ STEP 2: BROWSER EVENT LOOP ]
  The browser fires an `onClick` synthetic event. 
  `WorkerDirectoryPage.jsx` calls `handleFilterSubmit()`.
  │
  ▼
[ STEP 3: AXIOS CALL ]
  `api.get('/workers?districtId=1&upazilaId=2&categoryId=1')` is invoked.
  Axios request interceptor executes: checks `localStorage` for `token`.
  Attaches header: `Authorization: Bearer eyJhbGci...`
  │
  ▼
[ STEP 4: NETWORK SOCKET TRANSMISSION ]
  The browser writes TCP data packets onto the network interface card (NIC).
  The packets travel through loopback address `127.0.0.1` targeting port 5000.
  │
  ▼
[ STEP 5: KESTREL WEB SERVER RECEIVES BYTES ]
  The Linux operating system wakes up the Kestrel process listening on port 5000.
  Kestrel parses the raw bytes into an `HttpContext` object containing request headers, query string, and body.
  │
  ▼
[ STEP 6: ASP.NET CORE MIDDLEWARE PIPELINE ]
  1. `ExceptionHandlingMiddleware`: Wraps the execution in a `try/catch` block.
  2. `UseCors`: Inspects the `Origin` header. Confirms `http://localhost:5173` is allowed.
  3. `UseAuthentication`: Inspects the JWT Bearer token if present. Validates signature.
  4. `UseAuthorization`: Verifies if the route requires special roles.
  │
  ▼
[ STEP 7: ACTION ROUTING & MODEL BINDING ]
  The routing engine matches `GET /api/workers` to `WorkersController.Search()`.
  The .NET Model Binder inspects the query string and automatically converts:
  - `"districtId=1"`  ──> `int? districtId = 1`
  - `"upazilaId=2"`   ──> `int? upazilaId = 2`
  - `"categoryId=1"`  ──> `int? categoryId = 1`
  │
  ▼
[ STEP 8: CONTROLLER DELEGATES TO REPOSITORY ]
  `WorkersController` calls `await _workerRepo.SearchWorkersAsync(categoryId, districtId, upazilaId, search)`.
  │
  ▼
[ STEP 9: EF CORE LINQ QUERY CONSTRUCTION ]
  Inside `ServiceProviderRepository.cs`, an `IQueryable<ServiceProviderProfile>` is constructed:
  ```csharp
  var query = _context.ServiceProviderProfiles
      .Include(p => p.User)
      .Include(p => p.WorkerCategories)
      .Where(p => p.VerificationStatus == VerificationStatus.Verified);
  ```
  │
  ▼
[ STEP 10: SQL TRANSLATION BY NPGSQL ]
  EF Core compiles the C# LINQ expression tree into native PostgreSQL SQL:
  ```sql
  SELECT p.id, u.full_name, u.phone_number, p.average_rating, p.total_reviews
  FROM service_provider_profiles p
  JOIN users u ON p.user_id = u.id
  JOIN worker_categories wc ON wc.worker_profile_id = p.id
  WHERE p.verification_status = 'verified' 
    AND p.district_id = 1 
    AND p.upazila_id = 2 
    AND wc.category_id = 1;
  ```
  │
  ▼
[ STEP 11: POSTGRESQL EXECUTION ENGINE ]
  PostgreSQL receives the SQL statement over socket port 5432:
  1. Parser & Rewriter: Checks syntax and permissions.
  2. Query Optimizer: Uses B-Tree index `idx_worker_profiles_search` to quickly find matching tuples.
  3. Buffer Pool: Fetches matching 8KB data pages from memory (or disk NVMe if cold).
  4. Returns the result rows as binary tabular data.
  │
  ▼
[ STEP 12: OBJECT MAPPING & DTO PROJECTION ]
  EF Core materializes the database rows into C# objects.
  The repository projects them into lightweight `WorkerSummaryDto` records:
  ```csharp
  new WorkerSummaryDto(
      Id: p.Id,
      FullName: p.User.FullName,
      Rating: p.AverageRating,
      ReviewCount: p.TotalReviews,
      ...
  )
  ```
  │
  ▼
[ STEP 13: CONTROLLER RETURNS HTTP 200 OK ]
  `WorkersController` wraps the DTO list in `Ok(workers)`.
  `System.Text.Json` serializes the C# list into a UTF-8 JSON text string.
  │
  ▼
[ STEP 14: KESTREL TRANSMITS HTTP RESPONSE ]
  Kestrel adds response headers:
  - `HTTP/1.1 200 OK`
  - `Content-Type: application/json; charset=utf-8`
  - `Content-Length: 1482`
  Sends packets over TCP socket back to the browser.
  │
  ▼
[ STEP 15: REACT STATE UPDATE & RE-RENDER ]
  1. Axios receives the JSON string, parses it into a JavaScript Array, and resolves the Promise.
  2. `WorkerDirectoryPage` calls `setWorkers(response.data)`.
  3. React triggers a re-render: compares Virtual DOM with real DOM.
  4. React injects 4 new `WorkerCard` components into the screen.
  5. The user sees 4 verified electrician cards with stars and ratings in Dumki!
```

---

## 8. Running the Entire Platform Locally

Follow these clear, step-by-step instructions to run the entire system on your computer right now:

### 8.1 Database Initialization

Make sure your PostgreSQL service is running:
```bash
sudo systemctl start postgresql
```

Execute the database creation and seeding scripts in your terminal:
```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE kajbazar_db;"

# 2. Execute schema definition (tables, constraints, triggers)
psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql

# 3. Execute seed data (roles, categories, geographic data, test users)
psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
```

Verify that the tables were created successfully:
```bash
psql -U postgres -d kajbazar_db -c "\dt"
```
You will see 12 tables listed:
- `admin_audit_logs`
- `categories`
- `community_recommendations`
- `districts`
- `reports`
- `reviews`
- `roles`
- `service_provider_profiles`
- `upazilas`
- `user_roles`
- `users`
- `worker_categories`

---

### 8.2 Running Backend API with `dotnet run`

Open a terminal window and navigate to the API project:
```bash
cd src/KajBazar.API
dotnet run
```

You should see:
```text
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
```

Open your web browser and visit `http://localhost:5000/swagger`. You will be greeted by the interactive **Swagger UI** displaying all available REST endpoints!

---

### 8.3 Running Frontend Vite Server with `npm run dev`

Open a second terminal window and navigate to the frontend directory:
```bash
cd client
npm install   # Only necessary the very first time
npm run dev
```

You should see:
```text
  VITE v5.4.14  ready in 220 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### 8.4 Verifying Full-Stack Integration in the Browser

1. Open your browser and navigate to `http://localhost:5173`.
2. You will see the **KajBazar** homepage with live statistics:
   - "Verified Service Providers"
   - "Districts & Upazilas Covered"
   - "Community Customer Reviews"
3. Click **"Find a Service Provider"** in the top navigation bar.
4. Select **District: Patuakhali**, **Upazila: Dumki**, and **Category: Electrician**.
5. You will see verified workers appear. Click **"Call Worker"** to instantly reveal their phone number (`01711-223344`).

---

### 8.5 Testing Live Endpoints with `curl`

You can verify that the backend API is working directly from your terminal using `curl`:

#### Test 1: Fetch Categories
```bash
curl -s http://localhost:5000/api/categories | jq .
```
Expected output: JSON array containing Electrician, Plumber, Carpenter, etc.

#### Test 2: Search Workers
```bash
curl -s "http://localhost:5000/api/workers?search=Kabir" | jq .
```
Expected output: JSON array containing Kabir Hossain's verified electrician profile.

#### Test 3: Authenticate User
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@kajbazar.com","password":"Password123#"}' | jq .
```
Expected output: JSON response containing a signed JWT token string!

---

## 9. Common Beginner Pitfalls & How to Avoid Them

### 9.1 Circular Dependencies Between Projects
- **The Problem**: You try to add a reference from `KajBazar.Core` to `KajBazar.Infrastructure`.
- **The Error**: `error MSB4006: There is a circular dependency in the target dependency graph.`
- **The Fix**: Remember the Onion Architecture! `Core` must remain pure. Core must NEVER reference Infrastructure.

### 9.2 Port Collisions (Port 5000, 5432, or 5173 Already in Use)
- **The Problem**: Another program or a zombie background instance is already holding port 5000.
- **The Error**: `System.IO.IOException: Failed to bind to address http://localhost:5000: address already in use.`
- **The Fix**: Find the culprit process and kill it:
  ```bash
  sudo lsof -i :5000
  # Note the PID, then terminate it:
  kill -9 <PID>
  ```

### 9.3 Case Sensitivity in PostgreSQL vs C# (Snake_case vs PascalCase)
- **The Problem**: In C#, properties are PascalCase (`AverageRating`). In PostgreSQL, unquoted column names are lowercase snake_case (`average_rating`).
- **The Error**: `Npgsql.PostgresException: relation "serviceproviderprofiles" does not exist.`
- **The Fix**: In `KajBazarDbContext.cs`, we use `.UseSnakeCaseNamingConvention()` from the `EFCore.NamingConventions` package. This automatically bridges the naming difference.

### 9.4 Forgetting `await` in Asynchronous Methods
- **The Problem**: You write `var users = _context.Users.ToListAsync();` without `await`.
- **The Error**: The variable `users` is of type `Task<List<User>>` rather than `List<User>`. If you try to loop over it, the code will fail to compile.
- **The Fix**: Always prefix async calls with `await`: `var users = await _context.Users.ToListAsync();`.

### 9.5 CORS Errors (Cross-Origin Resource Sharing)
- **The Problem**: The browser blocks requests from `http://localhost:5173` to `http://localhost:5000`.
- **The Error**: `Access to XMLHttpRequest at 'http://localhost:5000/api/workers' from origin 'http://localhost:5173' has been blocked by CORS policy.`
- **The Fix**: Ensure `app.UseCors("AllowFrontend")` is placed **before** `app.UseAuthentication()` and `app.UseAuthorization()` in `Program.cs`.

### 9.6 Environment Variable and Connection String Misconfigurations
- **The Problem**: PostgreSQL connection fails with password authentication failed.
- **The Fix**: Ensure your `appsettings.json` connection string password matches what was set during PostgreSQL installation (`ALTER USER postgres PASSWORD 'postgres';`).

---

## 10. Hands-on Beginner Exercises & Practical Challenges

To solidify your understanding, attempt these five practical development exercises:

### 10.1 Exercise 1: Adding a New Field to an Entity
- **Objective**: Add a `FacebookUrl` string property to `ServiceProviderProfile`.
- **Steps**:
  1. Open `src/KajBazar.Core/Entities/ServiceProviderProfile.cs`.
  2. Add:
     ```csharp
     public string? FacebookUrl { get; set; }
     ```
  3. In `sql/01_schema_ddl.sql`, add `facebook_url VARCHAR(255)` to `service_provider_profiles`.
  4. In `src/KajBazar.Core/DTOs/DTOs.cs`, update `WorkerProfileDetailDto` to include `string? FacebookUrl`.
  5. In `ServiceProviderRepository.cs`, map `FacebookUrl = p.FacebookUrl`.
  6. Rebuild and run tests: `dotnet test KajBazar.sln`.

### 10.2 Exercise 2: Adding a Custom Health Check Endpoint
- **Objective**: Add a dedicated health check endpoint at `/api/health`.
- **Steps**:
  1. In `src/KajBazar.API/Controllers/AuthController.cs`, add:
     ```csharp
     [HttpGet("health")]
     [AllowAnonymous]
     public IActionResult HealthCheck()
     {
         return Ok(new 
         { 
             status = "healthy", 
             system = "KajBazar API",
             timestamp = DateTime.UtcNow 
         });
     }
     ```
  2. Test with curl: `curl http://localhost:5000/api/auth/health`.

### 10.3 Exercise 3: Adding a Custom Filter to the Frontend
- **Objective**: Add a minimum rating filter (e.g. "4 stars and above") in `WorkerDirectoryPage.jsx`.
- **Steps**:
  1. Add a state variable: `const [minRating, setMinRating] = useState(0);`.
  2. In the render function, filter the worker list:
     ```javascript
     const filteredWorkers = workers.filter(w => w.rating >= minRating);
     ```
  3. Add a `<select>` dropdown in the UI allowing the user to choose 0, 3, 4, or 5 stars.

### 10.4 Exercise 4: Writing a Custom Middleware for Request Duration
- **Objective**: Log how many milliseconds every HTTP request takes to execute.
- **Steps**:
  1. Create `src/KajBazar.API/Middleware/PerformanceMiddleware.cs`:
     ```csharp
     public class PerformanceMiddleware
     {
         private readonly RequestDelegate _next;
         private readonly ILogger<PerformanceMiddleware> _logger;

         public PerformanceMiddleware(RequestDelegate next, ILogger<PerformanceMiddleware> logger)
         {
             _next = next;
             _logger = logger;
         }

         public async Task InvokeAsync(HttpContext context)
         {
             var stopwatch = System.Diagnostics.Stopwatch.StartNew();
             await _next(context);
             stopwatch.Stop();
             _logger.LogInformation("Request {Path} executed in {Elapsed}ms", context.Request.Path, stopwatch.ElapsedMilliseconds);
         }
     }
     ```
  2. Register in `Program.cs`: `app.UseMiddleware<PerformanceMiddleware>();`.

### 10.5 Exercise 5: Adding a Worker Profile Card Badge
- **Objective**: Render a "Top Rated" gold badge on `WorkerCard.jsx` if `worker.rating >= 4.5` and `worker.reviewCount >= 5`.
- **Steps**:
  1. In `client/src/components/WorkerComponents.jsx`, inside `WorkerCard`:
     ```javascript
     {worker.rating >= 4.5 && worker.reviewCount >= 5 && (
       <span className="badge badge-gold">🏆 Top Rated</span>
     )}
     ```
  2. Add CSS in `App.css`:
     ```css
     .badge-gold {
       background: #fef3c7;
       color: #92400e;
       font-weight: 700;
       padding: 2px 8px;
       border-radius: 9999px;
       font-size: 0.75rem;
     }
     ```

---

## 11. Frequently Asked Questions (FAQ) for Absolute Beginners

### Q1: Why do we use PostgreSQL instead of MySQL or MongoDB?
**Answer**: PostgreSQL was chosen because KajBazar's core domain is highly relational. A worker belongs to a user, has many categories, operates in specific upazilas, receives reviews from other users, and has audit records. PostgreSQL provides world-class ACID compliance, powerful check constraints (regex validation on phone numbers), and built-in PL/pgSQL triggers for automatic rating calculations.

### Q2: Why .NET 8 instead of Node.js/Express or Python/FastAPI for the backend?
**Answer**: .NET 8 delivers extraordinary throughput (over 1M requests/sec on Kestrel), strong compile-time type safety via C# 12, built-in Dependency Injection, native support for Entity Framework Core, and robust enterprise authentication libraries. It enforces architectural discipline, preventing "spaghetti code" common in large dynamic language codebases.

### Q3: Why do we need DTOs? Why not just return the Entity directly from the controller?
**Answer**: Three critical reasons:
1. **Security (Prevent Overposting Attacks)**: If you return or bind an entity directly, a malicious user could submit `{ "isAdmin": true, "passwordHash": "..." }` and overwrite database columns!
2. **Prevent Circular Reference Exceptions**: A `User` references `ServiceProviderProfile`, and `ServiceProviderProfile` references `User`. If you serialize the entity directly to JSON, the serializer enters an infinite loop and crashes with `JsonException: A possible object cycle was detected`.
3. **Decoupling**: You can change your database table columns without breaking mobile apps or frontend clients that rely on the API contract.

### Q4: What is the difference between `dotnet build` and `dotnet run`?
**Answer**: `dotnet build` compiles your C# code into Intermediate Language (IL) assemblies (`.dll` files) and verifies there are no syntax or type errors. `dotnet run` first performs a build, and then immediately launches the resulting `.dll` executable inside the .NET runtime.

### Q5: What does `npm run dev` do under the hood?
**Answer**: `npm run dev` starts the **Vite Development Server**. Vite reads `vite.config.js`, starts a local HTTP server on port 5173, watches all `.jsx` and `.css` files for changes, and uses Hot Module Replacement (HMR) via WebSockets to instantly push code updates to your open browser tab without reloading the page.

### Q6: What is a JWT token, and where should it be stored in the browser?
**Answer**: A JSON Web Token (JWT) is a cryptographically signed text string containing user identity information (User ID, Name, Roles). When a user logs in, the server returns the JWT. The frontend stores it in `localStorage` or an HTTP-only cookie and sends it in the `Authorization: Bearer <token>` header on every subsequent API request.

### Q7: What is Business Rule BR-06, and why is it important?
**Answer**: Rule BR-06 states: *"Service provider contact phone numbers must not be displayed publicly in plain text on search result cards. Customers must click 'Call Worker' to reveal the phone number."* This protects informal workers from aggressive web scraping, spam bots, and harassment, while simultaneously allowing the platform to track customer engagement and intent.

### Q8: What is an In-Memory Database in xUnit tests?
**Answer**: An In-Memory database is an EF Core provider that stores data entirely in RAM rather than connecting to a physical PostgreSQL server on disk. This allows automated test suites to run in under 1 second without needing a live database connection or network setup.

### Q9: Can I deploy KajBazar on a free VPS or Raspberry Pi?
**Answer**: Yes! Both .NET 8 and React run natively on ARM64 architectures (including Raspberry Pi 4/5). With memory optimization, KajBazar can easily run on a $4/month VPS with 1 GB of RAM.

### Q10: How do I reset my database back to a clean state?
**Answer**: Run:
```bash
psql -U postgres -c "DROP DATABASE kajbazar_db;"
psql -U postgres -c "CREATE DATABASE kajbazar_db;"
psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql
psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
```

---

## 12. Conclusion & Roadmap to Volume 02

Congratulations! You have completed **Volume 01: Complete Architecture & Build From Scratch Guide**.

You now possess:
- A rock-solid conceptual mental model of how clients, servers, and databases work together.
- A deep understanding of Clean Architecture, Dependency Inversion, and 3-Tier Layering.
- The step-by-step CLI commands required to scaffold the entire project from zero.
- Complete familiarity with the solution files, project configurations, and directory structure.
- Microsecond-level comprehension of a web request lifecycle.

In the next volume, we will zoom in on the data layer and master PostgreSQL:
👉 **Proceed to [Volume 02: Database Guide & Production Hardening](02-database-guide-and-production-hardening.md)**
