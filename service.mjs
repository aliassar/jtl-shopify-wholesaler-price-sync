import cron from 'node-cron';
import main from './main.mjs'

cron.schedule('0 10 * * *', main);