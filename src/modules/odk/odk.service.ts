import { Injectable } from '@nestjs/common';
import { kerabariDb } from '../drizzle/kerabari-db';
import { buddhashantiDb } from '../drizzle/buddhashanti-db';
import { surveyForms as kerabariSurveyForms } from '../drizzle/kerabari-db/schema';
import { surveyForms as buddhashantiSurveyForms } from '../drizzle/buddhashanti-db/schema';
import { fetchSurveySubmissions as fetchKerabariSurveySubmissions } from './kerabari-services/utils';
import { fetchSurveySubmissions as fetchBuddhashantiSurveySubmissions } from './buddhashanti-services/utils';
import { eq } from 'drizzle-orm';
import { minio } from '@app/config/minio';
import { generateHourlyIntervals, generateWeeklyIntervals } from './utils';
import { gadhawaDb } from '../drizzle/gadhawa-db';
import { surveyForms as gadhawaSurveyForms } from '../drizzle/gadhawa-db/schema';
import { fetchSurveySubmissions as fetchGadhawaSurveySubmissions } from './gadhawa-services/utils';
import { lungriDb } from '../drizzle/lungri-db';
import { surveyForms as lungriSurveyForms } from '../drizzle/lungri-db/schema';
import { fetchSurveySubmissions as fetchLungriSurveySubmissions } from './lungri-services/utils';
import { duduwaDb } from '../drizzle/duduwa-db';
import { surveyForms as duduwaSurveyForms } from '../drizzle/duduwa-db/schema';
import { fetchSurveySubmissions as fetchDuduwaSurveySubmissions } from './duduwa-services/utils';

@Injectable()
export class OdkService {
  async getKerabariData() {
    // Use kerabariDb for database operations
    return {
      title: 'Kerabari Rural Municipality',
      address: 'Jhapa, Koshi Province',
      // Add more data processing logic here
    };
  }

  async getBuddhashatiData() {
    // Use buddhashantiDb for database operations
    return {
      title: 'Buddhashanti Rural Municipality',
      address: 'Jhapa, Koshi Province',
      // Add more data processing logic here
    };
  }

  async fetchKerabariSubmissions({ id, startDate, endDate }) {
    console.log('Fetching submissions for Kerabari form:', id);
    const surveyForm = await kerabariDb
      .select()
      .from(kerabariSurveyForms)
      .where(eq(kerabariSurveyForms.id, id))
      .limit(1);
    console.log('Survey form:', surveyForm);

    if (!surveyForm.length) {
      throw new Error('Survey form not found');
    }

    const {
      userName,
      password,
      odkFormId,
      odkProjectId,
      siteEndpoint,
      attachmentPaths,
    } = surveyForm[0];

    console.log('Fetching submissions for Kerabari form:', surveyForm[0].name);
    const timeIntervals = generateHourlyIntervals(startDate, endDate);
    console.log(`Generated ${timeIntervals.length} hourly intervals`);

    for (const [index, interval] of timeIntervals.entries()) {
      console.log(`Processing interval ${index + 1}/${timeIntervals.length}`);
      console.log(`Start: ${interval.start}`);
      console.log(`End: ${interval.end}`);

      await fetchKerabariSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as any[],
          formId: id,
          startDate: interval.start,
          endDate: interval.end,
          count: 100000,
        },
        { db: kerabariDb, minio },
      );

      console.log(`Completed interval ${index + 1}/${timeIntervals.length}`);
    }
    return true;
  }

  async fetchBuddhashatiSubmissions({ id, startDate, endDate }) {
    const surveyForm = await buddhashantiDb
      .select()
      .from(buddhashantiSurveyForms)
      .where(eq(buddhashantiSurveyForms.id, id))
      .limit(1);

    if (!surveyForm.length) {
      throw new Error('Survey form not found');
    }

    const {
      userName,
      password,
      odkFormId,
      odkProjectId,
      siteEndpoint,
      attachmentPaths,
    } = surveyForm[0];

    console.log(
      'Fetching submissions for Buddhashanti form:',
      surveyForm[0].name,
    );
    const timeIntervals = generateHourlyIntervals(startDate, endDate);
    console.log(`Generated ${timeIntervals.length} hourly intervals`);

    for (const [index, interval] of timeIntervals.entries()) {
      console.log(`Processing interval ${index + 1}/${timeIntervals.length}`);
      console.log(`Start: ${interval.start}`);
      console.log(`End: ${interval.end}`);

      await fetchBuddhashantiSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as any[],
          formId: id,
          startDate: interval.start,
          endDate: interval.end,
          count: 100000,
        },
        { db: buddhashantiDb, minio },
      );

      console.log(`Completed interval ${index + 1}/${timeIntervals.length}`);
    }
    return true;
  }

  async getGadhawaData() {
    return {
      title: 'Gadhawa Rural Municipality',
      address: 'Dang, Lumbini Province',
    };
  }

  async fetchGadhawaSubmissions({ id, startDate, endDate }) {
    const surveyForm = await gadhawaDb
      .select()
      .from(gadhawaSurveyForms)
      .where(eq(gadhawaSurveyForms.id, id))
      .limit(1);

    if (!surveyForm.length) {
      throw new Error('Survey form not found');
    }

    const {
      userName,
      password,
      odkFormId,
      odkProjectId,
      siteEndpoint,
      attachmentPaths,
    } = surveyForm[0];

    console.log('Fetching submissions for Gadhawa form:', surveyForm[0].name);
    const timeIntervals = generateWeeklyIntervals(startDate, endDate);
    console.log(`Generated ${timeIntervals.length} hourly intervals`);

    for (const [index, interval] of timeIntervals.entries()) {
      console.log(`Processing interval ${index + 1}/${timeIntervals.length}`);
      console.log(`Start: ${interval.start}`);
      console.log(`End: ${interval.end}`);

      await fetchGadhawaSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as any[],
          formId: id,
          startDate: interval.start,
          endDate: interval.end,
          count: 100000,
        },
        { db: gadhawaDb, minio },
      );

      console.log(`Completed interval ${index + 1}/${timeIntervals.length}`);
    }
    return true;
  }

  async getLungriData() {
    return {
      title: 'Lungri Rural Municipality',
      address: 'Rolpa, Lumbini Province',
    };
  }

  async fetchLungriSubmissions({ id, startDate, endDate }) {
    const surveyForm = await lungriDb
      .select()
      .from(lungriSurveyForms)
      .where(eq(lungriSurveyForms.id, id))
      .limit(1);

    if (!surveyForm.length) {
      throw new Error('Survey form not found');
    }

    const {
      userName,
      password,
      odkFormId,
      odkProjectId,
      siteEndpoint,
      attachmentPaths,
    } = surveyForm[0];

    console.log('Fetching submissions for Lungri form:', surveyForm[0].name);
    const timeIntervals = generateWeeklyIntervals(startDate, endDate);
    console.log(`Generated ${timeIntervals.length} hourly intervals`);

    for (const [index, interval] of timeIntervals.entries()) {
      console.log(`Processing interval ${index + 1}/${timeIntervals.length}`);
      console.log(`Start: ${interval.start}`);
      console.log(`End: ${interval.end}`);

      await fetchLungriSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as any[],
          formId: id,
          startDate: interval.start,
          endDate: interval.end,
          count: 100000,
        },
        { db: lungriDb, minio },
      );

      console.log(`Completed interval ${index + 1}/${timeIntervals.length}`);
    }
    return true;
  }

  async getDuduwaData() {
    return {
      title: 'Duduwa Rural Municipality',
      address: 'Banke, Lumbini Province',
    };
  }

  async fetchDuduwaSubmissions({ id, startDate, endDate }) {
    const surveyForm = await duduwaDb
      .select()
      .from(duduwaSurveyForms)
      .where(eq(duduwaSurveyForms.id, id))
      .limit(1);

    if (!surveyForm.length) {
      throw new Error('Survey form not found');
    }

    const {
      userName,
      password,
      odkFormId,
      odkProjectId,
      siteEndpoint,
      attachmentPaths,
    } = surveyForm[0];

    console.log('Fetching submissions for Duduwa form:', surveyForm[0].name);
    const timeIntervals = generateHourlyIntervals(startDate, endDate);
    console.log(`Generated ${timeIntervals.length} hourly intervals`);

    for (const [index, interval] of timeIntervals.entries()) {
      console.log(`Processing interval ${index + 1}/${timeIntervals.length}`);
      console.log(`Start: ${interval.start}`);
      console.log(`End: ${interval.end}`);

      await fetchDuduwaSurveySubmissions(
        {
          siteEndpoint: siteEndpoint as string,
          userName: userName as string,
          password: password as string,
          odkFormId: odkFormId as string,
          odkProjectId: odkProjectId as number,
          attachmentPaths: attachmentPaths as any[],
          formId: id,
          startDate: interval.start,
          endDate: interval.end,
          count: 100000,
        },
        { db: duduwaDb, minio },
      );

      console.log(`Completed interval ${index + 1}/${timeIntervals.length}`);
    }
    return true;
  }
}
