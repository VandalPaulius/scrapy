const routes = require('./routes')

exports.configureApi = ({ router }) => {
    routes.dataFeeds.configure({ router });
}
