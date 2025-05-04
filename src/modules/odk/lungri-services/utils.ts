import axios from 'axios';
import { surveyData } from '@app/modules/drizzle/lungri-db/schema';
import { getODKToken } from './odk/auth';
import { handleAttachment } from './attachment/handler';
import { ODKConfig } from './types';
import { handleBuildingFlow } from './sync/building/building';
import { handleBusinessFlow } from './sync/business/business';
import { handleFamilyFlow } from './sync/family/family';

export const fetchSurveySubmissions = async (
  {
    siteEndpoint,
    userName,
    password,
    odkFormId,
    odkProjectId,
    attachmentPaths,
    formId,
    startDate,
    endDate,
    count,
  }: {
    siteEndpoint: string;
    userName: string;
    password: string;
    odkFormId: string;
    odkProjectId: number;
    attachmentPaths: any[];
    formId: string;
    startDate?: string;
    endDate?: string;
    count?: number;
  },
  ctx: any,
) => {
  const token = await getODKToken(siteEndpoint, userName, password);
  const odkConfig: ODKConfig = {
    siteEndpoint,
    odkProjectId: odkProjectId.toString(),
    odkFormId,
    token,
  };

  // Set default date ranges if not provided
  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() - 1);
  const defaultEndDate = new Date(today);

  // Configure query parameters for ODK API
  const queryParams = {
    $top: count ?? 100, // Number of records to fetch, default 100
    $skip: 0, // Start from beginning
    $expand: '*', // Expand all relationships
    $count: true, // Include total count
    $wkt: false, // Don't use WKT format for geometries
    $filter: `__system/submissionDate ge ${startDate ?? defaultStartDate.toISOString()} and __system/submissionDate le ${endDate ?? defaultEndDate.toISOString()}`,
  };

  try {
    // Build query string from parameters
    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    // Fetch submissions from ODK API
    const response = await axios.get(
      `${siteEndpoint}/v1/projects/${odkProjectId}/forms/${odkFormId}.svc/Submissions?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const submissions = response.data.value;
    console.log('Successfully fetched submissions:', submissions.length);

    // Process each submission
    for (const submission of submissions) {
      // Insert submission data into survey_data table
      await ctx.db
        .insert(surveyData)
        .values({
          id: submission.__id,
          formId: formId,
          data: submission,
        })
        .onConflictDoNothing();

      // Process attachments if any are specified
      if (attachmentPaths) {
        for (const attachmentPath of attachmentPaths) {
          try {
            await handleAttachment(submission, attachmentPath, ctx, odkConfig);
          } catch (error) {
            console.error(
              `Failed to handle attachment for submission ${submission.__id}:`,
              error,
            );
          }
        }
      }

      switch (formId) {
        case 'lungri_building_survey':
          try {
            await handleBuildingFlow(submission, ctx);
          } catch (error) {
            console.error(
              `Failed to handle building flow for submission ${submission.__id}:`,
              error,
            );
          }
          break;
        case 'lungri_business_survey':
          try {
            await handleBusinessFlow(submission, ctx);
          } catch (error) {
            console.error(
              `Failed to handle business flow for submission ${submission.__id}:`,
              error,
            );
          }
          break;
        case 'lungri_family_survey':
          try {
            await handleFamilyFlow(submission, ctx);
          } catch (error) {
            console.error(
              `Failed to handle family flow for submission ${submission.__id}:`,
              error,
            );
          }
          break;
        default:
          console.log('No handler found for form ID:', formId);
      }
    }
  } catch (error) {
    console.log(error);
    // throw new Error(`Failed to get submissions: ${(error as any).message}`);
  }
};
