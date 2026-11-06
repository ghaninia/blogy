import { campaignRouter } from './interface/campaign.controller.js';
import { subscriberRouter } from './interface/subscriber.controller.js';

export const subscriberModule = {
  path: '/api/subscribers',
  router: subscriberRouter,
};

export const newsletterModule = {
  path: '/api/newsletter',
  router: campaignRouter,
};
