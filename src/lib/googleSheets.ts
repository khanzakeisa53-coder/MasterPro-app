import { getAccessToken } from './firebaseAuth';

export interface SheetRowData {
  title: string;
  category: string;
  summary: string;
  content: string;
  timestamp: string;
  status: string;
}

/**
 * Creates a brand new Google Spreadsheet with headers formatted for App Master Pro exports
 */
export async function createSpreadsheet(title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || 'App Master Pro - AI Workspace Export',
      },
      sheets: [
        {
          properties: {
            title: 'Workspace Logs',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Project Title' } },
                    { userEnteredValue: { stringValue: 'Category' } },
                    { userEnteredValue: { stringValue: 'Status' } },
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'AI Output Preview' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Sheets API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Appends row data to an existing Google Spreadsheet
 */
export async function appendRowToSheet(
  spreadsheetId: string,
  row: SheetRowData
): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const range = 'Workspace Logs!A:E';
  const values = [
    [
      row.title,
      row.category,
      row.status,
      row.timestamp,
      row.content.substring(0, 1000), // Trim preview to prevent cell overflow
    ],
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append to sheet (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Fetches recent rows from a Google Spreadsheet
 */
export async function fetchSheetRows(spreadsheetId: string): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const range = 'Workspace Logs!A1:E50';
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to read sheet values (${res.status})`);
  }

  const data = await res.json();
  return data.values || [];
}
