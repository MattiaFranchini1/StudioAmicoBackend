const express = require('express')
const cors=require('cors')
const app = express()

const port = 3000

app.use(cors({
    origin:'*'
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})