const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const R = require("ramda")

const csvHeadings = [
  "User", "First Name", "Last Name", "Date", "Holding", "Value",
]

const separateHoldings = investment => R.map(holding => R.mergeDeepRight(investment, {holding}), investment.holdings)

const getValue = inv => R.multiply(inv.investmentTotal, inv.holding.investmentPercentage)

const getCompany = (inv, companies) => R.pipe(
  R.find(R.propEq("id", inv.holding.id)),
  R.prop("name"),
)(companies)

const fieldGetters = [
  R.prop("userId"),
  R.prop("firstName"),
  R.prop("lastName"),
  R.prop("date"),
  (inv, companies) => getCompany(inv, companies),
  inv => getValue(inv),
]

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/report", async (req, res) => {

  // get all investments
  request.get(`${config.investmentsServiceUrl}/investments`, async (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {

      // get company names associated with investment holdings
      request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, r, companies) => {
        if (e) {
          console.error(e)
          res.send(500)
        } else {

          const parsedCompanies = JSON.parse(companies)
          const parsedInvestments = JSON.parse(investments)

          // map through each user, make a separate "row" for each holding they have, alter the fields
          const processInvestment = investment => R.map(fieldGetter => fieldGetter(investment, parsedCompanies), fieldGetters)

          const csvRows = R.pipe(
            R.chain(separateHoldings),
            R.map(processInvestment),
          )(parsedInvestments)

          // add headings to the csv array
          csvRows.unshift(csvHeadings)

          // create csv content by formatting csvRows with commas and new lines
          const csvContent = csvRows.map(row => row.join(",")).join("\n")
          const csvJsonFormat = JSON.stringify({csv: csvContent})

          // forward to exports
          request.post({
            uri: `${config.investmentsServiceUrl}/investments/export`,
            headers: {
              "content-type": "application/json",
            },
            body: csvJsonFormat,
          }, (e) => {
            if (e) {
              console.error(e)
              res.sendStatus(500)
            }
          })
          res.contentType("text/csv")
          res.send(csvContent)
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
      res.sendStatus(500)
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
