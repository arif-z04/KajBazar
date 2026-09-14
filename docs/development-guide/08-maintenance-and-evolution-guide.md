# Volume 08: Maintenance & Evolution Guide
## The Complete Database Migration, Dependency Auditing, Feature Engineering, and System Evolution Handbook for KajBazar

---

## 📖 Welcome to System Evolution

There is a famous law in software engineering formulated by Manny Lehman in 1974:
> **Lehman's First Law of Software Evolution**: *"A software system that is used will undergo continuing change, or become progressively less useful in its environment."*

Software is never "finished".
- When KajBazar launches in Patuakhali, customers will immediately ask: *"Can I chat directly with the electrician inside the app before calling them?"*
- Workers will ask: *"Can customers book appointments on a calendar so I don't get double-booked?"*
- Security auditors will ask: *"How do you verify customer phone numbers with SMS OTPs?"*

If you build a rigid system, adding these features will break your existing code. But because KajBazar was designed using **Clean Architecture, DTOs, and the Repository Pattern**, our platform is built from day one to **evolve gracefully without breaking existing functionality**.

This volume teaches you how to maintain, patch, and evolve KajBazar, complete with full end-to-end source code implementations for **three major new features**.

---

## 📑 Master Table of Contents

1. [The Lifecycle of an Enterprise Software Platform](#1-the-lifecycle-of-an-enterprise-software-platform)
   - 1.1 The Myth of "Done" Software
   - 1.2 The Software Maintenance Spectrum: Corrective, Adaptive, Perfective, Preventive
   - 1.3 Technical Debt: What It Is, How It Accumulates, and How to Pay It Down
2. [Database Schema Evolution & Safe Migrations](#2-database-schema-evolution--safe-migrations)
   - 2.1 The Danger of Breaking Database Changes in Production
   - 2.2 The Expand and Contract Pattern (Parallel Change)
   - 2.3 Adding Columns Safely (Always Nullable or with Defaults)
   - 2.4 Index Creation Without Table Locks (`CREATE INDEX CONCURRENTLY`)
3. [Routine Automated Database Maintenance](#3-routine-automated-database-maintenance)
   - 3.1 Understanding Table Bloat in PostgreSQL
   - 3.2 Automated `VACUUM ANALYZE` Scheduling
   - 3.3 Reindexing Strategy (`REINDEX TABLE CONCURRENTLY`)
   - 3.4 Log Rotation with `logrotate`
4. [Dependency Auditing & Security Upgrades](#4-dependency-auditing--security-upgrades)
   - 4.1 NuGet Dependency Audits (`dotnet list package --vulnerable`)
   - 4.2 Npm Dependency Audits (`npm audit fix`)
   - 4.3 Automated Dependency Pull Requests with Dependabot
5. [Complete End-to-End Feature 1: Real-Time In-App Chat / Messaging](#5-complete-end-to-end-feature-1-real-time-in-app-chat--messaging)
   - 5.1 Architecture & Database Schema (`chat_messages` table)
   - 5.2 Domain Entity & DTOs
   - 5.3 ASP.NET Core SignalR Real-Time WebSocket Hub (`ChatHub.cs`)
   - 5.4 React Frontend Real-Time Chat Drawer Component
6. [Complete End-to-End Feature 2: Service Booking & Appointment Scheduling](#6-complete-end-to-end-feature-2-service-booking--appointment-scheduling)
   - 6.1 State Machine Design (`Pending` -> `Confirmed` -> `InProgress` -> `Completed` -> `Cancelled`)
   - 6.2 Database Schema & Domain Entity (`bookings` table)
   - 6.3 Booking Repository & Controller
   - 6.4 React Booking Modal & Customer Appointment View
7. [Complete End-to-End Feature 3: SMS Verification Gateway Integration](#7-complete-end-to-end-feature-3-sms-verification-gateway-integration)
   - 6.1 One-Time Password (OTP) Cryptographic Generation
   - 6.2 Database Schema (`otp_verifications` table)
   - 6.3 Local Bangladeshi SMS Gateway Client (Teletalk / SSL Wireless / Twilio)
   - 6.4 Controller & Verification UI Flow
8. [Refactoring & Code Quality Audits](#8-refactoring--code-quality-audits)
9. [Frequently Asked Questions (FAQ) on Maintenance & Evolution](#9-frequently-asked-questions-faq-on-maintenance--evolution)
10. [Conclusion & Roadmap to Volume 09](#10-conclusion--roadmap-to-volume-09)

---

## 1. The Lifecycle of an Enterprise Software Platform

### 1.1 The Software Maintenance Spectrum

Professional maintenance is categorized into four disciplines:
1. **Corrective Maintenance (Bug Fixing)**: Diagnosing and repairing errors reported by users (e.g. fixing an issue where rating stars don't render on iOS Safari).
2. **Adaptive Maintenance (Environment Changes)**: Updating the system when external environments change (e.g. upgrading to .NET 9, updating PostgreSQL 16 to 17, or supporting updated browser security standards).
3. **Perfective Maintenance (Feature Evolution)**: Adding new capabilities requested by users (e.g. real-time chat, appointment bookings, bilingual Bengali language toggle).
4. **Preventive Maintenance (Refactoring & Debt Reduction)**: Improving code structure, optimizing database indexes, and writing documentation before bugs occur.

---

### 1.2 The Expand and Contract Pattern for Zero-Downtime Database Changes

In production, you can **never** execute:
```sql
-- DANGEROUS! BREAKS PRODUCTION!
ALTER TABLE users DROP COLUMN phone_number;
```
If your old backend code is still running on 3 server nodes, the moment you drop that column, every user query crashes with `column does not exist`!

Instead, follow the **Expand and Contract Pattern**:

```
[ Phase 1: Expand ]
  - Add new column: ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20);
  - Update backend code to WRITE to both old and new columns, but READ from old.
  - Deploy backend.

[ Phase 2: Backfill ]
  - Run background script: UPDATE users SET mobile_number = phone_number WHERE mobile_number IS NULL;

[ Phase 3: Switch ]
  - Update backend code to READ from mobile_number.
  - Deploy backend.

[ Phase 4: Contract ]
  - Safely drop old column: ALTER TABLE users DROP COLUMN phone_number;
  - Zero downtime! Zero user errors!
```

---

## 2. Complete End-to-End Feature 1: Real-Time In-App Chat / Messaging

Let us implement a complete new feature: **Real-Time Direct Messaging between Customers and Workers**.

### 2.1 Database Schema (`sql/05_chat_feature.sql`)

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_conversation 
ON chat_messages (sender_user_id, recipient_user_id, created_at);
```

---

### 2.2 C# Domain Entity (`src/KajBazar.Core/Entities/ChatMessage.cs`)

```csharp
namespace KajBazar.Core.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    public Guid SenderUserId { get; set; }
    public Guid RecipientUserId { get; set; }
    public string MessageText { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Sender { get; set; } = null!;
    public User Recipient { get; set; } = null!;
}
```

---

### 2.3 ASP.NET Core SignalR Real-Time Hub (`src/KajBazar.API/Hubs/ChatHub.cs`)

```csharp
using System.Security.Claims;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace KajBazar.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly KajBazarDbContext _context;

    public ChatHub(KajBazarDbContext context)
    {
        _context = context;
    }

    public async Task SendMessage(Guid recipientUserId, string messageText)
    {
        var senderIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(senderIdStr, out var senderUserId))
            return;

        // 1. Persist message to database
        var message = new ChatMessage
        {
            SenderUserId = senderUserId,
            RecipientUserId = recipientUserId,
            MessageText = messageText,
            CreatedAt = DateTime.UtcNow
        };
        _context.Set<ChatMessage>().Add(message);
        await _context.SaveChangesAsync();

        // 2. Broadcast in real time via WebSockets to recipient's client connection
        await Clients.User(recipientUserId.ToString()).SendAsync("ReceiveMessage", new
        {
            id = message.Id,
            senderUserId = senderUserId,
            messageText = messageText,
            createdAt = message.CreatedAt
        });
    }
}
```

---

### 2.4 React Frontend Chat Drawer Component (`client/src/components/ChatDrawer.jsx`)

```javascript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const ChatDrawer = ({ recipientUserId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const response = await api.post('/chat/send', {
        recipientUserId,
        messageText: inputText,
      });
      setMessages([...messages, response.data]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="chat-drawer">
      <div className="chat-header">
        <h4>Chat with {recipientName}</h4>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>
      <div className="chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.isMine ? 'mine' : 'theirs'}`}>
            <p>{msg.messageText}</p>
            <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-footer">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
};
```

---

## 3. Routine Automated Database Maintenance

To keep PostgreSQL operating at peak velocity:

### 3.1 Weekly Database Maintenance Shell Script (`/usr/local/bin/pg-maintenance.sh`)

```bash
#!/usr/bin/env bash
set -eo pipefail

DB_NAME="kajbazar_db"

echo "[$(date)] Running VACUUM ANALYZE on $DB_NAME..."
psql -U postgres -d "$DB_NAME" -c "VACUUM ANALYZE VERBOSE;"

echo "[$(date)] Reindexing high-traffic search indexes..."
psql -U postgres -d "$DB_NAME" -c "REINDEX INDEX CONCURRENTLY idx_worker_profiles_search;"
psql -U postgres -d "$DB_NAME" -c "REINDEX INDEX CONCURRENTLY idx_reviews_worker;"

echo "[$(date)] Maintenance complete!"
```

---

## 4. Conclusion & Roadmap to Volume 09

Congratulations! You now know how to evolve KajBazar, perform zero-downtime database expansions, audit security dependencies, and add enterprise real-time features like WebSockets and appointments!

In the next volume, we will study **Application Security & Incident Response**:
👉 **Proceed to [Volume 09: Security & Incident Response Guide](09-security-and-incident-response-guide.md)**

---

## 5. Complete End-to-End Feature 2: Service Booking & Appointment Scheduling

Let us implement the complete source code for **Service Bookings & Appointments**.

### 5.1 Database Schema (`sql/06_booking_feature.sql`)

```sql
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_profile_id INT NOT NULL REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    scheduled_date TIMESTAMPTZ NOT NULL,
    service_address TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    estimated_cost NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings (worker_profile_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings (customer_id, scheduled_date);
```

---

### 5.2 C# Domain Entity (`src/KajBazar.Core/Entities/Booking.cs`)

```csharp
namespace KajBazar.Core.Entities;

public enum BookingStatus
{
    Pending,
    Confirmed,
    InProgress,
    Completed,
    Cancelled
}

public class Booking
{
    public int Id { get; set; }
    public Guid CustomerId { get; set; }
    public int WorkerProfileId { get; set; }
    public int CategoryId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string ServiceAddress { get; set; } = string.Empty;
    public string ProblemDescription { get; set; } = string.Empty;
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public decimal? EstimatedCost { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Customer { get; set; } = null!;
    public ServiceProviderProfile WorkerProfile { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
```

---

### 5.3 ASP.NET Core Booking Controller (`src/KajBazar.API/Controllers/BookingsController.cs`)

```csharp
using System.Security.Claims;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KajBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly KajBazarDbContext _context;

    public BookingsController(KajBazarDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(customerIdStr, out var customerId))
            return Unauthorized();

        var booking = new Booking
        {
            CustomerId = customerId,
            WorkerProfileId = request.WorkerProfileId,
            CategoryId = request.CategoryId,
            ScheduledDate = request.ScheduledDate,
            ServiceAddress = request.ServiceAddress,
            ProblemDescription = request.ProblemDescription,
            Status = BookingStatus.Pending
        };

        _context.Set<Booking>().Add(booking);
        await _context.SaveChangesAsync();

        return Ok(booking);
    }

    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(customerIdStr, out var customerId))
            return Unauthorized();

        var bookings = await _context.Set<Booking>()
            .Include(b => b.WorkerProfile)
                .ThenInclude(wp => wp.User)
            .Include(b => b.Category)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.ScheduledDate)
            .ToListAsync();

        return Ok(bookings);
    }
}

public record CreateBookingRequest(
    int WorkerProfileId,
    int CategoryId,
    DateTime ScheduledDate,
    string ServiceAddress,
    string ProblemDescription
);
```

---

## 6. Complete End-to-End Feature 3: SMS Verification Gateway Integration

Let us implement SMS One-Time Password (OTP) verification for Bangladeshi mobile numbers:

### 6.1 C# SMS Service Implementation (`src/KajBazar.Infrastructure/Services/SmsService.cs`)

```csharp
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KajBazar.Infrastructure.Services;

public interface ISmsService
{
    Task<bool> SendOtpAsync(string phoneNumber, string otpCode);
}

public class SmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<SmsService> _logger;

    public SmsService(HttpClient httpClient, IConfiguration config, ILogger<SmsService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(string phoneNumber, string otpCode)
    {
        try
        {
            var apiKey = _config["Sms:ApiKey"];
            var senderId = _config["Sms:SenderId"] ?? "KajBazar";
            var message = $"[KajBazar] Your verification code is: {otpCode}. Valid for 5 minutes. Do not share this code.";

            // Local Bangladeshi SMS API endpoint (e.g. SSL Wireless / Greenweb / Teletalk)
            var payload = new
            {
                api_key = apiKey,
                senderid = senderId,
                number = phoneNumber,
                message = message
            };

            var response = await _httpClient.PostAsJsonAsync("https://api.smsnet.bd/sendsms", payload);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS OTP sent successfully to {Phone}", phoneNumber);
                return true;
            }

            _logger.LogWarning("SMS API returned non-success code: {Status}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dispatch SMS OTP to {Phone}", phoneNumber);
            return false;
        }
    }
}
```
