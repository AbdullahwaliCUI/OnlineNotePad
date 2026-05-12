export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/**
 * Searches for a folder by name created by the app.
 * Returns the folder ID if found, otherwise null.
 */
export async function findAppFolder(accessToken: string, folderName: string = 'OnlineNotePad'): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to find folder');
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding App Folder:', error);
    return null;
  }
}

/**
 * Creates a folder in the user's Google Drive.
 */
export async function createAppFolder(accessToken: string, folderName: string = 'OnlineNotePad'): Promise<string | null> {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating App Folder:', error);
    return null;
  }
}

/**
 * Helper to ensure the main folder exists.
 */
export async function getOrCreateAppFolder(accessToken: string, folderName: string = 'OnlineNotePad'): Promise<string | null> {
  let folderId = await findAppFolder(accessToken, folderName);
  if (!folderId) {
    folderId = await createAppFolder(accessToken, folderName);
  }
  return folderId;
}

/**
 * Saves a note to Google Drive.
 */
export async function saveNoteToDrive(
  accessToken: string,
  title: string,
  contentHtml: string,
  folderId: string
): Promise<boolean> {
  try {
    // We are going to save it as a simple HTML document for now
    // Alternatively, we could convert it to a Google Doc by using mimeType 'application/vnd.google-apps.document'
    
    // Boundary string for multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: `${title}.html`,
      mimeType: 'text/html',
      parents: [folderId],
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/html\r\n\r\n' +
      contentHtml +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Drive upload failed:', err);
      throw new Error('Failed to save file to drive');
    }

    return true;
  } catch (error) {
    console.error('Error saving note to Drive:', error);
    return false;
  }
}
