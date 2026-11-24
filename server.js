import express from "express";
import pg from "pg"
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

db.connect();

app.set("view engine", "ejs");
app.use(express.static("public"));
//function to convert numbers to currency format
function toCurrency(value) {
    return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

app.get("/", async (req, res) => {
    try{
        const pageSize = 10;

        const customerCount = await db.query("SELECT count(*) FROM customers");
        const totalCustomers = Number(customerCount.rows[0].count);
        const totalPages = Math.max(1, Math.ceil(totalCustomers / pageSize));

        let page = parseInt(req.query.page) || 1;
        page = Math.min(Math.max(page, 1), totalPages);
        const offset = (page - 1) * pageSize;

        const customers = await db.query(
            "SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2",
            [pageSize, offset]
        );

        const revenue = await db.query("SELECT sum(saleamount) FROM sales");

        // 4. sales with the product name instead of the product id
        const sales = await db.query(
            `SELECT products.name, sales.quantity, sales.saleamount
            FROM sales
            LEFT JOIN products ON sales.productid = products.id
            ORDER BY sales.id ASC`
        );

        const orders = await db.query("SELECT count(quantity) FROM orders");
        const issuesCount = await db.query("SELECT count(id) FROM alerts WHERE type = 'issues'");
        const issues = await db.query("SELECT * FROM alerts WHERE type = 'issues'");

        const notificationsCount = await db.query("SELECT count(id) FROM alerts WHERE type = 'notifications'");
        const notifications = await db.query("SELECT * FROM alerts WHERE type = 'notifications'");
        const tasks = await db.query("SELECT * FROM alerts WHERE type = 'tasks'");

        res.render("index", {
            username: "UTRGV Vaqueros",
            revenue: toCurrency(revenue.rows[0].sum),
            customerNum: totalCustomers.toLocaleString("en-US"),
            ordersAmt: Number(orders.rows[0].count).toLocaleString("en-US"),
            issuesAmt: issuesCount.rows[0].count,
            notifAmt: notificationsCount.rows[0].count,
            customers: customers.rows,
            sales: sales.rows.map((s) => ({ ...s, saleamount: toCurrency(s.saleamount) })),
            issues: issues.rows,
            notifications: notifications.rows,
            tasks: tasks.rows,
            page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});