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

const fieldGetters = [inv => inv.userId, inv => inv.firstName, inv => inv.lastName, inv => inv.date, inv => getHoldings(inv), inv => getValue(inv)]

const getValue = (inv) => {
  return inv.investmentTotal * inv.holding.investmentPercentage
}

// const getHoldings = () => {return "placeholder"}

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/report", (req, res) => {
  request.get(`${config.investmentsServiceUrl}/investments`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      
      const parsedInvestments = JSON.parse(investments)

      const csvRows = parsedInvestments.map(separateHoldings).flat().map(investment => fieldGetters.map(fieldGetter => fieldGetter(investment)))

      csvRows.unshift(csvHeadings)

      const csvContent = csvRows.map(row => row.join(',') + '/n')

      const investmentsReport = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })

      // content type should equal text/csv
      // csv should be returned as text

      // forward to exports
      res.send(200)
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
