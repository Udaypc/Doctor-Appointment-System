# Doctor Appointment System

A microservices Doctor Appointment System. Patients can search doctors, book slots, manage profiles, and leave ratings. Doctors can manage schedules and view appointments.

The backend is **Spring Boot** with **Eureka** and an **API Gateway**. The UI is **Next.js** (React).

---

## Features

- Patient and doctor registration / login (JWT)
- Browse doctors by specialty, view profile, ratings, and available slots
- Book appointments (booked slots stay visible but disabled)
- Patient appointments and profile editing
- Doctor dashboard: manage schedule (dates and time slots)
- Ratings and reviews for doctors
- API Gateway routing and Eureka service discovery
- Inter-service calls with Feign Client
- MySQL per service

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT |
| Service registry | Eureka Server |
| API Gateway | Spring Cloud Gateway |
| Communication | OpenFeign |
| Database | MySQL |
| Build | Maven (backend), npm (UI) |

---

## Architecture

```
Browser (Next.js :3000)
        |
        |  /api/*  (rewritten to gateway)
        v
API Gateway (:9091)
        |
        +-- Auth Service (:8086)
        +-- Patient Service (:8082)
        +-- Doctor Service (:8085)
        +-- Booking Service (:8089)
        +-- Payment Service (:8084)
        |
Eureka Server (:8761)
```

### Services

| Service | Folder | Port | Role |
| --- | --- | --- | --- |
| Eureka | `eurekaServer` | 8761 | Service registry |
| Auth | `auth-service` | 8086 | Register, login, JWT |
| Patient | `patient-service` | 8082 | Patient profiles |
| Doctor | `doctor-service` | 8085 | Doctors, schedules, reviews |
| Booking | `booking-service` | 8089 | Appointments |
| Payment | `payment-service` | 8084 | Checkout (optional / stub) |
| API Gateway | `api-gateway` | 9091 | Routing |
| UI | `doctor-appointment-ui` | 3000 | Next.js app |

Gateway path prefixes: `/auth/**`, `/patient/**`, `/doctor/**`, `/booking/**`, `/payment/**`.

---

## Security flow

1. User registers or logs in through Auth Service.
2. Auth Service returns a JWT (and role / entity id).
3. The UI stores the session and sends the token on API calls.
4. API Gateway can validate the token and route to the target service.

---

## Database

Create these MySQL databases locally (Hibernate `ddl-auto=update` creates tables):

| Database | Service |
| --- | --- |
| `auth-service` | Auth |
| `patient_db` | Patient |
| `doctor-service` | Doctor |
| `booking-service` | Booking |
| `payment_db` | Payment |

Default local credentials in `application.properties` are `root` / `password@123`. Change them to match your MySQL setup.

---

## How to run

**Prerequisites:** JDK 17+, Maven, Node.js 18+, MySQL running locally.

On Windows, if Maven SSL fails, set:

```powershell
$env:MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"
```

Start in this order:

1. **Eureka**
   ```bash
   cd eurekaServer
   mvn spring-boot:run
   ```
2. **Auth, Patient, Doctor, Booking, Payment** (each in its own terminal)
   ```bash
   cd auth-service && mvn spring-boot:run
   cd patient-service && mvn spring-boot:run
   cd doctor-service && mvn spring-boot:run
   cd booking-service && mvn spring-boot:run
   cd payment-service && mvn spring-boot:run
   ```
3. **API Gateway**
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```
4. **UI**
   ```bash
   cd doctor-appointment-ui
   npm install
   npm run dev
   ```

Open:

- App: [http://localhost:3000](http://localhost:3000)
- Eureka: [http://localhost:8761](http://localhost:8761)

Wait about 15 seconds after services start so they can register with Eureka. If the home page is empty, refresh once.

The UI proxies `/api/*` to `http://localhost:9091`.
