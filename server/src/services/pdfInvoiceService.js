import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import OrganizationSettings from '../models/OrganizationSettings.js';

/**
 * Generates an enterprise-styled PDF invoice for a rental order.
 */
export const generateInvoicePDF = async (invoice, order, customer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const settings = (await OrganizationSettings.findOne()) || {
        companyName: 'Apex Rentals & Logistics Ltd.',
        email: 'support@apexrentals.com',
        phone: '+91 98765 43210',
        address: 'Suite 402, Technology Park, Mumbai, MH',
        currency: '₹',
      };

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Header ---
      doc
        .fillColor('#1e293b')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(settings.companyName, 50, 45);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(settings.address, 50, 72)
        .text(`Email: ${settings.email} | Phone: ${settings.phone}`, 50, 85);

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('INVOICE', 400, 45, { align: 'right' });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 72, { align: 'right' })
        .text(`Order #: ${order.orderNumber}`, 400, 85, { align: 'right' })
        .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 400, 98, { align: 'right' });

      doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e2e8f0').stroke();

      // --- Bill To & Order Info ---
      const topY = 130;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('BILLED TO:', 50, topY);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(customer.name, 50, topY + 15)
        .text(customer.email, 50, topY + 28)
        .text(customer.phone || 'Phone: N/A', 50, topY + 41);

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('RENTAL FULFILLMENT:', 350, topY);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`Method: ${order.fulfillmentType === 'store_pickup' ? 'Store Pickup' : 'Doorstep Delivery'}`, 350, topY + 15)
        .text(`Start: ${new Date(order.pickupScheduledAt).toLocaleString()}`, 350, topY + 28)
        .text(`Scheduled Return: ${new Date(order.returnScheduledAt).toLocaleString()}`, 350, topY + 41);

      // --- Table Header ---
      const tableTop = 200;
      doc.rect(50, tableTop, 495, 24).fill('#f1f5f9');

      doc
        .fillColor('#334155')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Description', 60, tableTop + 7)
        .text('Period', 270, tableTop + 7)
        .text('Rate', 400, tableTop + 7, { width: 50, align: 'right' })
        .text('Amount', 460, tableTop + 7, { width: 75, align: 'right' });

      // --- Table Rows ---
      let currentY = tableTop + 30;
      doc.font('Helvetica').fontSize(9).fillColor('#1e293b');

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          doc
            .text(item.title, 60, currentY, { width: 200 })
            .text(item.periodString || '-', 270, currentY, { width: 120 })
            .text(`${settings.currency}${item.amount}`, 460, currentY, { width: 75, align: 'right' });
          currentY += 22;
        });
      } else {
        doc.text('Standard Rental Fee', 60, currentY);
        doc.text(`${settings.currency}${invoice.subtotal}`, 460, currentY, { width: 75, align: 'right' });
        currentY += 22;
      }

      doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#e2e8f0').stroke();
      currentY += 15;

      // --- Summary Section ---
      const summaryLeft = 330;
      const valRight = 460;
      const valWidth = 75;

      const printSummaryLine = (label, val, bold = false) => {
        if (bold) doc.font('Helvetica-Bold').fillColor('#0f172a');
        else doc.font('Helvetica').fillColor('#475569');

        doc.text(label, summaryLeft, currentY);
        doc.text(val, valRight, currentY, { width: valWidth, align: 'right' });
        currentY += 18;
      };

      printSummaryLine('Rental Subtotal:', `${settings.currency}${invoice.subtotal.toFixed(2)}`);
      printSummaryLine('GST / Tax:', `${settings.currency}${invoice.taxAmount.toFixed(2)}`);
      printSummaryLine('Security Deposit (Held):', `${settings.currency}${invoice.depositAmount.toFixed(2)}`);

      if (invoice.lateFeeAmount > 0) {
        printSummaryLine('Late Return Penalty:', `+ ${settings.currency}${invoice.lateFeeAmount.toFixed(2)}`);
      }
      if (invoice.damageFeeAmount > 0) {
        printSummaryLine('Damage & Loss Deductions:', `+ ${settings.currency}${invoice.damageFeeAmount.toFixed(2)}`);
      }
      if (invoice.refundAmount > 0) {
        printSummaryLine('Net Deposit Refunded:', `- ${settings.currency}${invoice.refundAmount.toFixed(2)}`);
      }

      currentY += 5;
      doc.rect(summaryLeft - 10, currentY - 5, 235, 26).fill('#f8fafc');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
      doc.text('Total Paid:', summaryLeft, currentY + 3);
      doc.text(`${settings.currency}${invoice.totalAmount.toFixed(2)}`, valRight, currentY + 3, {
        width: valWidth,
        align: 'right',
      });

      // --- Footer / Terms ---
      const footerY = 700;
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e2e8f0').stroke();
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Terms & Conditions: Security deposits are refunded after condition and on-time return inspection.', 50, footerY + 10)
        .text('Late returns beyond grace period accrue penalties. Incurred damages are deducted from held deposit.', 50, footerY + 22)
        .text('This is a computer-generated invoice and requires no physical signature.', 50, footerY + 34, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/invoices/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
