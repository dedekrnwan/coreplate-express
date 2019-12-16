import * as express from 'express';
import redis from 'redis';
import lodash from 'lodash';
import redisService from '../services/redis.service';
import Exception from '../utils/exception';
import response from '../utils/response';

export default {
	handler: async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> => {
		try {
			// checking cached and response
			if (['get'].includes(req.method.toLowerCase())) {
				const redisClient: redis.RedisClient = await redisService();
				const cacheKey = `${req.originalUrl}`;
				redisClient.get(cacheKey, (err, result) => {
					if (err) {
						next(new Exception(err));
					}
					if (result) {
						const structured = response.ok(JSON.parse(result));
						if (!lodash.isEqual(res.locals.query, structured.query)) {
							delete structured.query;
							global.logger.info(structured);
							res.status(200).json(structured);
						} else {
							next();
						}
					} else {
						next();
					}
				});
			} else {
				next();
			}
		} catch (error) {
			next(new Exception(error));
		}
	},
	caching: async (structured: any, req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> => {
		try {
			// checking cached and response
			if (['get'].includes(req.method.toLowerCase()) && structured.code === 200) {
				const redisClient: redis.RedisClient = await redisService();
				const cacheKey = `${req.originalUrl}`;
				structured.query = res.locals.query;
				redisClient.setex(cacheKey, 3600, JSON.stringify(structured), (error, rtr) => {
    				if (error) {
						next(new Exception(error));
    				} else {
						next(structured);
					}
    			});
			} else {
				next(structured);
			}
		} catch (error) {
			next(new Exception(error));
		}
	},
};