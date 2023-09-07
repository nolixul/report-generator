# Moneyhub Tech Test - Investments and Holdings

At Moneyhub we use microservices to partition and separate the concerns of the codebase. In this exercise we have given you an example `admin` service and some accompanying services to work with. In this case the admin service backs a front end admin tool allowing non-technical staff to interact with data.

A request for a new admin feature has been received

## Requirements

- As an admin, I want to be able to generate a CSV report showing the values of all user investment holdings
  - Any new routes should be added to the **admin** service
  - The csv report should be sent to the `/export` route of the **investments** service
  - The investments `/export` route expects the following:
    - content-type as `application/json`
    - JSON object containing the report as csv string, i.e, `{csv: '|User|First Name|...'}`
  - The csv should contain a row for each holding matching the following headers
    |User|First Name|Last Name|Date|Holding|Value|
  - The **Holding** property should be the name of the holding account given by the **financial-companies** service
  - The **Value** property can be calculated by `investmentTotal * investmentPercentage`
  - The new route in the admin service handling the generation of the csv report should return the csv as text with content type `text/csv`
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages but there is no expectation to replace them)
- Make effective use of git

We prefer:

- Functional code
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

### Notes

All of you work should take place inside the `admin` microservice

For the purposes of this task we would assume there are sufficient security middleware, permissions access and PII safe protocols, you do not need to add additional security measures as part of this exercise.

You are free to use any packages that would help with this task

We're interested in how you break down the work and build your solution in a clean, reusable and testable manner rather than seeing a perfect example, try to only spend around _1-2 hours_ working on it

## Deliverables

**Please make sure to update the readme with**:

- Your new routes
- How to run any additional scripts or tests you may have added
- Relating to the task please add answers to the following questions;
  1. How might you make this service more secure?
  2. How would you make this solution scale to millions of records?
  3. What else would you have liked to improve given more time?

On completion email a link to your repository to your contact at Moneyhub and ensure it is publicly accessible.

## Getting Started

Please clone this service and push it to your own github (or other) public repository

To develop against all the services each one will need to be started in each service run

```bash
npm start
or
npm run develop
```

The develop command will run nodemon allowing you to make changes without restarting

The services will try to use ports 8081, 8082 and 8083

Use Postman or any API tool of you choice to trigger your endpoints (this is how we will test your new route).

### Existing routes

We have provided a series of routes

Investments - localhost:8081

- `/investments` get all investments
- `/investments/:id` get an investment record by id
- `/investments/export` expects a csv formatted text input as the body

Financial Companies - localhost:8082

- `/companies` get all companies details
- `/companies/:id` get company by id

Admin - localhost:8083

- `/investments/:id` get an investment record by id

## Nadia's section

### New route

Admin - localhost:8083

- `/investments/report` get a report of all investment holdings and post it to `investments/export`

### Notes on packages

- Ran `npm i` in **admin**, 22 vulnerabilities - 10 high, 3 critical.

  - Ran `npm audit` to see what the vulnerabilities are. **tough-cookie** has a prototype pollution vulnerability, there is no fix available. **request** has server-side request forgery in request and depends on vulnerable versions of **tough-cookie**, there is no fix available.
  - Ran `npm audit fix` to auto fix vulnerabilities, got peer dependency issues.
  - Given more time, would fix peer dependency issues to resolve vulnerabilities and would remove or replace **tough-cookie** and **request**

- Ran `npm i` in **financial-companies**, 18 vulnerabilities - 10 high, 1 critical.

  - Ran `npm audit` to see what the vulnerabilities are. All packages have fixes available via `npm audit fix`.
  - Ran `npm audit fix` to auto fix vulnerabilities, got peer dependency issues.
  - Given more time, would fix peer dependency issues to resolve vulnerabilities.

- Ran `npm i` in **investments**, 21 vulnerabilities - 13 high, 1 critical.

  - Ran `npm audit` to see what the vulnerabilities are. All packages have fixes available via `npm audit fix`.
  - Ran `npm audit fix` to auto fix vulnerabilities, got peer dependency issues.
  - Given more time, would fix peer dependency issues to resolve vulnerabilities.

_Alternatively I could have run `npm audit fix --force`, but I don't want to break this project when there's a limited amount of time to spend on it._

### Local set up

- Added an insomnia project with an environment for localhost and subenvironments for each port for manual testing.

### Tackling the challenge

#### Breaking down the requirements

_I re-arranged the requirements bullet points into an order that make more sense to me, and moved the code standard specific requirements out into a different list._

##### Requirements

- As an admin, I want to be able to generate a CSV report showing the values of all user investment holdings
- A new route in the admin service handling the generation of the csv report should return the csv as text with content type `text/csv`
  - The csv should contain a row for each holding matching the following headers
    |User|First Name|Last Name|Date|Holding|Value|
  - The **Holding** property should be the name of the holding account given by the **financial-companies** service
  - The **Value** property can be calculated by `investmentTotal * investmentPercentage`
- The csv report should be sent to the `/export` route of the **investments** service
- The investments `/export` route expects the following:
  - content-type as `application/json`
  - JSON object containing the report as csv string, i.e, `{csv: '|User|First Name|...'}`

##### Coding Standards Requirements

- Any new routes should be added to the **admin** service
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages but there is no expectation to replace them)
- Make effective use of git

We prefer:

- Functional code
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

#### Process

- Tested the provided routes were working with insomnia.
- Broke down the task and started with the smallest item needed to make this work, as though I was doing TDD.
- Wrote a get investments route to fetch all investments.
- Wrote sudo code on what I wanted to do with the data I had, to get it into report form.
- Got sidetracked by looking at Rambda.js - love it. Experimented with their sandbox environment and their documentation.
- Decided to write in JavaScript due to time constraints.
- Wrote a function for making a user entry for each holding.
- Wrote a series of "fieldGetter" functions to alter the data for the report, left the getCompany one for last.
- Had some issues getting a single company ID to return, after some experimentation, wrote a function similar to the one in the `/companies/:id` endpoint, and fetched all the companies once.
- Researched csv files, how to generate them, etc. Found a suitable article and started to build my csv string.
- Wrote a post route to export the csv report in a json object.
- Returned the csv report out of the original get investments route.
- Was manually testing this whole time using insomnia and console.logs.

### The questions

**How might you make this service more secure?**

- Updating the packages with vulnerabilities.
- Removing / replacing the deprecated packages (request).
- I would question if we need to send investment reports between two microservices, and if we do, make sure they have very strict access policies.
- Writing tests.

**How would you make this solution scale to millions of records?**

- Host it on a scalable cloud solution that can handle millions of requests.
- Make the csv files multipart or chunked, chunk the requests.

**What else would you have liked to improve given more time?**

- Writing tests.
- I would have liked to use Rambda.js. I enjoyed experimenting with it, and if I had a few more hours I'd refactor this code with it.
- Sorting out the deprecated packages.
