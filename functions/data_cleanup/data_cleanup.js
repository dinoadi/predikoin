/**
 * Appwrite Function: data_cleanup
 * Trigger: Cron daily at midnight (0 0 * * *)
 * Purpose: Delete data older than 1 day to keep database lightweight
 */

const { Client, Databases, Query } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

  try {
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || 1);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    console.log(`Cleanup: Deleting data older than ${cutoffDate.toISOString()}`);

    const results = {
      deletedRecords: {},
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Collections to cleanup
    const collections = [
      'price_data',
      'sentiment_data',
      'ta_alerts',
      'predictions'
    ];

    // Delete from each collection
    for (const collectionId of collections) {
      try {
        // Query documents older than retention period
        const older = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.lessThan('timestamp', cutoffTimestamp)]
        );

        console.log(`${collectionId}: Found ${older.total} old records`);

        // Delete each document
        let deleted = 0;
        for (const doc of older.documents) {
          try {
            await databases.deleteDocument(databaseId, collectionId, doc.$id);
            deleted++;
          } catch (err) {
            console.error(`Failed to delete ${collectionId}/${doc.$id}:`, err.message);
            results.errors.push({
              collection: collectionId,
              docId: doc.$id,
              error: err.message
            });
          }
        }

        results.deletedRecords[collectionId] = deleted;
      } catch (error) {
        console.error(`Error cleaning ${collectionId}:`, error.message);
        results.errors.push({
          collection: collectionId,
          error: error.message
        });
      }
    }

    // Special handling for notifications - keep success=true for 7 days
    try {
      const notifCutoff = new Date();
      notifCutoff.setDate(notifCutoff.getDate() - 7);

      const failedNotif = await databases.listDocuments(
        databaseId,
        'notifications',
        [
          Query.equal('success', false),
          Query.lessThan('sentAt', notifCutoff.toISOString())
        ]
      );

      console.log(`notifications: Found ${failedNotif.total} failed records to delete`);

      let deleted = 0;
      for (const doc of failedNotif.documents) {
        try {
          await databases.deleteDocument(databaseId, 'notifications', doc.$id);
          deleted++;
        } catch (err) {
          results.errors.push({
            collection: 'notifications',
            docId: doc.$id,
            error: err.message
          });
        }
      }

      results.deletedRecords['notifications'] = deleted;
    } catch (error) {
      console.error('Error cleaning notifications:', error.message);
      results.errors.push({
        collection: 'notifications',
        error: error.message
      });
    }

    console.log('Cleanup complete:', results);

    return res.json({
      success: true,
      message: 'Data cleanup completed',
      retentionDays,
      cutoffDate: cutoffTimestamp,
      results
    });
  } catch (error) {
    console.error('Cleanup Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
