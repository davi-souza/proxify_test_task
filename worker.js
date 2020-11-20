const axios = require('axios');
const uuid = require('uuid');
const { getClient } = require('./pool');

async function worker() {
    this.id = uuid.v4();
    this.client = await getClient();
    this.requestId = null;

    log('start');

    while (true) {
        try {
            const nextRequest = await getNextRequestFromDb(client);
            if (!nextRequest) {
                continue;
            }

            const { id: requestId, url } = nextRequest;
            this.requestId = requestId;

            const saved = await saveRequestStartOnDb(requestId);
            if (!saved) {
                this.requestId = null;
                continue;
            }

            log(`processing url: ${url} (id: ${requestId})`);

            const httpCode = await processRequest(url);

            await saveRequestHttpCodeOnDb(requestId, httpCode);
        } catch (error) {
            log(`error - ${error.message}`);
            this.requestId && (await saveRequestErrorOnDb(this.requestId));
        } finally {
            this.requestId = null;
        }
    }

    function log(message) {
        console.log(`> Worker ${this.id} - ${message}`);
    }
    async function getNextRequestFromDb() {
        const {
            rows: [nextRequest],
        } = await this.client.query(
            `select *
            from "request"
            where status = 'NEW'
            order by id asc
            limit 1`
        );
        return nextRequest;
    }
    async function saveRequestStartOnDb(id) {
        const { rowCount } = await this.client.query(
            `update "request" set status = 'PROCESSING'
			where id = $1
			and status = 'NEW'`,
            [id]
        );
        return rowCount > 0;
    }
    async function processRequest(url) {
        try {
            const { status } = await axios.get(url);
            return status;
        } catch (axiosError) {
            const { response } = axiosError;
            if (!response) {
                throw axiosError;
            }
            return response.status;
        }
    }
    async function saveRequestHttpCodeOnDb(id, code) {
        const { rowCount } = await this.client.query(
            `update "request" set status = 'DONE', http_code = $1
			where id = $2
			and status = 'PROCESSING'
			`,
            [code, id]
        );
        return rowCount > 0;
    }
    async function saveRequestErrorOnDb(id) {
        const { rowCount } = await this.client.query(
            `update "request" set status = 'ERROR'
			where id = $1
			and status = 'PROCESSING'
			`,
            [id]
        );
        return rowCount > 0;
    }
}

worker();
