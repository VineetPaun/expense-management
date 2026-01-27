import express from 'express'

const app = express()

app.use(express.json())

app.get('/signup', (req, res) => {
    const {username, password} = req.body
    
    res.json({
        name: "Vineet"
    })
})

app.listen(3000, () => {
    console.log("App started")
})