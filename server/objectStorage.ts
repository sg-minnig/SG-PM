// Object storage service for handling file uploads (profile images)
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// Initialize Google Cloud Storage client
export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectStorageService {
  // Get presigned URL for uploading a profile image (bound to user)
  async getProfileImageUploadURL(userId: string): Promise<{ uploadURL: string; objectPath: string }> {
    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
    if (!privateObjectDir) {
      throw new Error("PRIVATE_OBJECT_DIR not set");
    }

    // Use userId in the path to bind uploads to specific users
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/profile-images/${userId}/${objectId}`;

    const { bucketName, objectName } = this.parseObjectPath(fullPath);
    const uploadURL = await this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900, // 15 minutes
    });

    return {
      uploadURL,
      objectPath: `/objects/profile-images/${userId}/${objectId}`,
    };
  }

  // Get presigned URL for uploading a document (bound to user)
  async getDocumentUploadURL(userId: string, filename: string): Promise<{ uploadURL: string; objectPath: string }> {
    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
    if (!privateObjectDir) {
      throw new Error("PRIVATE_OBJECT_DIR not set");
    }

    // Use userId in the path to bind uploads to specific users
    const objectId = randomUUID();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = `${privateObjectDir}/documents/${userId}/${objectId}-${sanitizedFilename}`;

    const { bucketName, objectName } = this.parseObjectPath(fullPath);
    const uploadURL = await this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900, // 15 minutes
    });

    return {
      uploadURL,
      objectPath: `/objects/documents/${userId}/${objectId}-${sanitizedFilename}`,
    };
  }

  // Get file from object storage and stream to response
  async getObject(objectPath: string): Promise<{ bucket: string; file: string } | null> {
    if (!objectPath.startsWith("/objects/")) {
      return null;
    }

    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
    if (!privateObjectDir) {
      return null;
    }

    // Extract the file path after /objects/
    const filePath = objectPath.replace("/objects/", "");
    const fullPath = `${privateObjectDir}/${filePath}`;

    const { bucketName, objectName } = this.parseObjectPath(fullPath);
    
    // Check if file exists
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return null;
    }

    return { bucket: bucketName, file: objectName };
  }

  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
  }

  private async signObjectURL({
    bucketName,
    objectName,
    method,
    ttlSec,
  }: {
    bucketName: string;
    objectName: string;
    method: "GET" | "PUT" | "DELETE" | "HEAD";
    ttlSec: number;
  }): Promise<string> {
    const request = {
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };

    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to sign object URL, errorcode: ${response.status}`
      );
    }

    const { signed_url: signedURL } = await response.json();
    return signedURL;
  }
}
