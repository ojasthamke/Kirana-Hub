import * as XLSX from 'xlsx';

export const exportToExcel = (orders: any[], filename: string) => {
    const data = orders.map((o: any) => ({
        'Order ID': o.order_id,
        'Store Name': o.store_name,
        'Amount': o.total_amount,
        'Status': o.status,
        'Payment Status': o.payment_status,
        'Date': new Date(o.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
