const routes = require('./routes')

exports.configureApi = ({ router, database }) => {
    routes.dataFeeds.configure({ router, database });
}
