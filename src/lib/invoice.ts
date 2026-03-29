import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order: any, vendor: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Vendor Info
    doc.setFontSize(12);
    doc.text(`Vendor: ${vendor.store_name}`, 20, 40);
    doc.text(`Address: ${vendor.store_address}`, 20, 46);
    doc.text(`GST No: ${vendor.gst_number}`, 20, 52);

    // Order Info
    doc.text(`Invoice No: ${order.order_id}`, 140, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 46);
    doc.text(`Customer: ${order.user_name}`, 140, 52);

    // Table
    const tableData = order.products.map((p: any) => [
        p.name_en,
        p.name_hi,
        p.quantity,
        `₹${p.price}`,
        `₹${p.total}`
    ]);

    autoTable(doc, {
        startY: 70,
        head: [['Product (EN)', 'Product (HI)', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${order.total_amount}`, 140, finalY);

    doc.save(`Invoice_${order.order_id}.pdf`);
};
