import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateCertificate = async (qualityData, imageUrl, userInfo) => {
  console.log('Generating certificate...', { score: qualityData.score, user: userInfo.name });
  
  const certificateId = generateCertificateId();
  
  try {
    // Create certificate HTML
    const certificateHTML = createCertificateHTML(qualityData, imageUrl, userInfo, certificateId);
    
    // Create temporary div for rendering
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = certificateHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);
    
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      width: 800,
      height: 600,
      scale: 1.5,
      useCORS: true,
      allowTaint: true
    });
    
    // Create PDF
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    console.log('Certificate generated successfully:', certificateId);
    
    return {
      pdf,
      certificateId,
      downloadUrl: pdf.output('bloburl')
    };
  } catch (error) {
    console.error('Certificate generation error:', error);
    
    // Fallback: create simple text-based PDF
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Wool Quality Certificate', 20, 30);
    pdf.setFontSize(12);
    pdf.text(`Certificate ID: ${certificateId}`, 20, 50);
    pdf.text(`Quality Score: ${qualityData.score}%`, 20, 70);
    pdf.text(`Category: ${qualityData.category}`, 20, 90);
    pdf.text(`User: ${userInfo.name}`, 20, 110);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 130);
    
    console.log('Using fallback certificate generation');
    
    return {
      pdf,
      certificateId,
      downloadUrl: pdf.output('bloburl')
    };
  }
};

const generateCertificateId = () => {
  return 'WQC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const createCertificateHTML = (qualityData, imageUrl, userInfo, certificateId) => {
  const currentDate = new Date().toLocaleDateString();
  
  // Use a placeholder image if imageUrl is not available or is a blob URL
  const safeImageUrl = imageUrl && !imageUrl.startsWith('blob:') 
    ? imageUrl 
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldvb2wgU2FtcGxlPC90ZXh0Pjwvc3ZnPg==';
  
  return `
    <div style="width: 800px; height: 600px; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: Arial, sans-serif; position: relative;">
      <div style="background: rgba(255,255,255,0.95); color: #333; padding: 30px; border-radius: 15px; height: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: bold;">WOOL QUALITY CERTIFICATE</h1>
          <div style="width: 100px; height: 3px; background: #3498db; margin: 10px auto;"></div>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 14px;">Digital Quality Assurance System</p>
        </div>
        
        <!-- Content Grid -->
        <div style="display: flex; gap: 30px; margin-bottom: 30px;">
          
          <!-- Left Column - Image -->
          <div style="flex: 1;">
            <div style="border: 3px solid #3498db; border-radius: 10px; padding: 10px; background: #f8f9fa;">
              <img src="${safeImageUrl}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px;" alt="Wool Sample" crossorigin="anonymous"/>
            </div>
          </div>
          
          <!-- Right Column - Details -->
          <div style="flex: 1;">
            <div style="background: #ecf0f1; padding: 20px; border-radius: 10px; height: 220px;">
              
              <!-- Quality Score -->
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${getScoreColor(qualityData.score)}; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                  ${qualityData.score}%
                </div>
                <h3 style="margin: 10px 0 5px 0; color: #2c3e50; font-size: 18px;">${qualityData.category}</h3>
              </div>
              
              <!-- Details -->
              <div style="font-size: 12px; line-height: 1.6;">
                <div style="margin-bottom: 8px;"><strong>Certificate ID:</strong> ${certificateId}</div>
                <div style="margin-bottom: 8px;"><strong>Analysis Date:</strong> ${currentDate}</div>
                <div style="margin-bottom: 8px;"><strong>Analyzed By:</strong> ${userInfo.name || 'Quality System'}</div>
                <div style="margin-bottom: 8px;"><strong>User Role:</strong> ${userInfo.role || 'Assessor'}</div>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 2px solid #bdc3c7; padding-top: 20px; text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #7f8c8d;">
              <div><strong>Wool Monitoring System</strong></div>
              <div>Farm to Fabric Traceability</div>
            </div>
            <div style="font-size: 12px; color: #7f8c8d; text-align: right;">
              <div>Verification ID: ${certificateId}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
};

const getScoreColor = (score) => {
  if (score > 75) return '#27ae60'; // Green
  if (score >= 40) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

export const downloadCertificate = (pdf, filename = 'wool-quality-certificate.pdf') => {
  pdf.save(filename);
};