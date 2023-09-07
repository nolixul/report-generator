const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const R = require("ramda")

const csvHeadings = [
  "User", "First Name", "Last Name", "Date", "Holding", "Value"
]

const separateHoldings = (investment) => {
  return investment.holdings.map((holding) => {
    return {
      ...investment, holding
    } 
  })
}

const fieldGetters = [inv => inv.userId, inv => inv.firstName, inv => inv.lastName, inv => inv.date, (inv, companies) => getCompany(inv, companies), inv => getValue(inv)]

const getValue = (inv) => {
  return inv.investmentTotal * inv.holding.investmentPercentage
}

const getCompany = (inv, companies) => companies.find(company => company.id === inv.holding.id).name

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/report", async (req, res) => {
  await request.get(`${config.investmentsServiceUrl}/investments`, async (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      await request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, r, companies) => {
        if (e) {
          console.error(e)
          res.send(500)
        } else {

          const parsedCompanies = JSON.parse(companies)
          const parsedInvestments = JSON.parse(investments)

          // map through each user, make a separate "row" for each holding they have, alter the fields
          const csvRows = parsedInvestments.map(separateHoldings).flat().map(investment => fieldGetters.map(fieldGetter => fieldGetter(investment, parsedCompanies)))

          // add headings to the csv array
          csvRows.unshift(csvHeadings)

          // create csv content by formatting csvRows
          const csvContent = csvRows.map(row => row.join(',') + '/n')

          // create binary large object with csvcontent, of type text/csv
          const investmentsReport = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })

          // content type should equal text/csv
          // csv should be returned as text

          // forward to exports
          res.sendStatus(200)
        }
      })
    }
  })
})

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
