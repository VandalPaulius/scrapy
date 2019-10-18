const routes = require("./routes");

exports.configureApi = ({ router }) => {
    routes.dataFeeds.configure({ router });
    routes.databases.configure({ router });
}
