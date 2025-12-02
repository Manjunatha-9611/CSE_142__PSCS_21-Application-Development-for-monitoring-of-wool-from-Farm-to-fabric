import QRCode from 'qrcode';

class EnhancedQRService {
  // Generate QR code for batch
  async generateBatchQR(batchData) {
    const qrData = {
      type: 'WOOL_BATCH',
      batchId: batchData.batchId,
      farmerId: batchData.farmerId,
      farmerName: batchData.farmerName,
      weight: batchData.weight,
      createdAt: batchData.createdAt,
      verificationUrl: `${window.location.origin}/verify/${batchData.batchId}`,
      timestamp: Date.now()
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrText: JSON.stringify(qrData)
      };
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Parse QR code data
  parseQRData(qrText) {
    try {
      const data = JSON.parse(qrText);
      
      if (data.type !== 'WOOL_BATCH') {
        throw new Error('Invalid QR code type');
      }

      return {
        isValid: true,
        data: data,
        batchId: data.batchId,
        farmerId: data.farmerId,
        farmerName: data.farmerName,
        weight: data.weight,
        createdAt: data.createdAt
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }
  }

  // Validate QR code against database
  async validateQRCode(qrData, firebaseService) {
    try {
      const parsedData = this.parseQRData(qrData);
      
      if (!parsedData.isValid) {
        return {
          isValid: false,
          error: parsedData.error
        };
      }

      // Check if batch exists in database
      const batch = await firebaseService.getBatch(parsedData.batchId);
      
      if (!batch) {
        return {
          isValid: false,
          error: 'Batch not found in database'
        };
      }

      // Verify batch data matches QR data
      if (batch.farmerId !== parsedData.farmerId || 
          batch.farmerName !== parsedData.farmerName) {
        return {
          isValid: false,
          error: 'QR code data does not match batch records'
        };
      }

      return {
        isValid: true,
        batch: batch,
        qrData: parsedData.data
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Validation failed: ' + error.message
      };
    }
  }

  // Generate tracking QR for specific location/process
  async generateTrackingQR(batchId, trackingData) {
    const qrData = {
      type: 'WOOL_TRACKING',
      batchId: batchId,
      location: trackingData.location,
      process: trackingData.process,
      actor: trackingData.actor,
      timestamp: Date.now(),
      verificationUrl: `${window.location.origin}/track/${batchId}`
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 1,
        color: {
          dark: '#1976d2',
          light: '#FFFFFF'
        }
      });

      return {
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrText: JSON.stringify(qrData)
      };
    } catch (error) {
      console.error('Tracking QR generation failed:', error);
      throw new Error('Failed to generate tracking QR code');
    }
  }

  // Generate certificate QR
  async generateCertificateQR(certificateData) {
    const qrData = {
      type: 'WOOL_CERTIFICATE',
      certificateId: certificateData.certificateId,
      batchId: certificateData.batchId,
      grade: certificateData.grade,
      assessor: certificateData.assessorName,
      issuedDate: certificateData.issuedDate,
      verificationHash: certificateData.verificationHash,
      verificationUrl: `${window.location.origin}/certificate/${certificateData.certificateId}`,
      timestamp: Date.now()
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 250,
        margin: 2,
        color: {
          dark: '#2e7d32',
          light: '#FFFFFF'
        }
      });

      return {
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrText: JSON.stringify(qrData)
      };
    } catch (error) {
      console.error('Certificate QR generation failed:', error);
      throw new Error('Failed to generate certificate QR code');
    }
  }

  // Download QR code as image
  downloadQRCode(qrCodeDataURL, filename = 'qr-code.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Print QR code
  printQRCode(qrCodeDataURL, batchInfo) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Wool Batch QR Code - ${batchInfo.batchId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              border: 2px solid #333; 
              padding: 20px; 
              display: inline-block; 
              margin: 20px;
            }
            .batch-info { 
              margin-top: 15px; 
              font-size: 14px; 
            }
            .batch-id { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeDataURL}" alt="Batch QR Code" />
            <div class="batch-info">
              <div class="batch-id">Batch ID: ${batchInfo.batchId}</div>
              <div>Farmer: ${batchInfo.farmerName}</div>
              <div>Weight: ${batchInfo.weight} kg</div>
              <div>Date: ${new Date(batchInfo.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Scan QR code using camera (simulation for demo)
  async simulateQRScan() {
    // In a real implementation, this would use the device camera
    // For demo purposes, we'll simulate scanning
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful scan
        const mockQRData = {
          type: 'WOOL_BATCH',
          batchId: 'WB-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          farmerId: 'farmer-001',
          farmerName: 'John Smith',
          weight: 150,
          createdAt: Date.now() - 86400000, // 1 day ago
          timestamp: Date.now()
        };
        
        resolve({
          success: true,
          data: JSON.stringify(mockQRData)
        });
      }, 2000);
    });
  }

  // Get QR code scanner component props
  getQRScannerProps(onScanSuccess, onScanError) {
    return {
      onResult: (result, error) => {
        if (result) {
          onScanSuccess(result.text);
        }
        if (error) {
          onScanError(error);
        }
      },
      style: { width: '100%', maxWidth: '400px' },
      constraints: {
        audio: false,
        video: { facingMode: 'environment' }
      }
    };
  }
}

const enhancedQRService = new EnhancedQRService();
export default enhancedQRService;