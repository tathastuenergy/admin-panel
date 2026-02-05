export interface EndPointApi {
    login: string;
    verifyOtp: string;
    register: string;
    logout: string;
    resendOtp: string;

    //Customer
    getAllCustomer?: string;
    getByIdCustomer?: string;
    createCustomer?: string;
    updateCustomer?: string;
    deleteCustomer?: string;
    customerStatement?: string;

    //Company
    createCompany: string;
    updateCompany: string;
    getAllCompany: string;

    //Inventory
    getAllInventory?: string;
    getByIdInventory?: string;
    createInventory: string;
    updateInventory?: string;
    deleteInventory?: string;
    uploadExcelInventory?: string;

    //Estimate
    getAllEstimate?: string;
    getByIdEstimate?: string;
    createEstimate?: string;
    updateEstimate?: string;
    deleteEstimate?: string;
    getLastEstimateNumber?: string;

    //Invoice
    getAllInvoice?: string;
    getByIdInvoice?: string;
    createInvoice?: string;
    updateInvoice?: string;
    deleteInvoice?: string;
    getLastInvoiceNumber?: string;
    estimateByNumber?: string

    //Payment
    getAllPayment: string;
    deletePayment: string;
    getByIdPayment: string;
    createPayment: string;
    updatePayment: string;
}

// Define and export the API endpoint object
const endPointApi: EndPointApi = {
    login: 'auth/login/send-otp',
    verifyOtp: 'auth/login/verify-otp',
    resendOtp: 'auth/login/resend-otp',
    register: 'auth/register',
    logout: 'auth/logout',

    //Customers
    getAllCustomer: 'customer/getall',
    getByIdCustomer: 'customer/getById',
    createCustomer: 'customer/create',
    updateCustomer: 'customer/update',
    deleteCustomer: 'customer/delete',
    customerStatement: 'customer',

    //Company
    createCompany: 'company/create',
    updateCompany: 'company/update',
    getAllCompany: 'company/getall',

    //Inventory
    getAllInventory: 'inventory/getall',
    getByIdInventory: 'inventory/getById',
    createInventory: 'inventory/create',
    updateInventory: 'inventory/update',
    deleteInventory: 'inventory/delete', 
    uploadExcelInventory: 'inventory/upload-excel', 

    //Estimate
    getAllEstimate: 'estimate/getall',
    getByIdEstimate: 'estimate/getById',
    createEstimate: 'estimate/create',
    updateEstimate: 'estimate/update',
    deleteEstimate: 'estimate/delete', 
    getLastEstimateNumber: 'estimate/last-estimate-number',
    estimateByNumber: 'estimate/by-number',

    //Invoice
    getAllInvoice: 'invoice/getall',
    getByIdInvoice: 'invoice/getById',
    createInvoice: 'invoice/create',
    updateInvoice: 'invoice/update',
    deleteInvoice: 'invoice/delete',
    getLastInvoiceNumber: 'invoice/last-invoice-number',

    //Payment
    getAllPayment: 'payment/getall',
    deletePayment: 'payment/delete',
    getByIdPayment: 'payment/getById',
    createPayment: 'payment/create',
    updatePayment: 'payment/update'
};

export default endPointApi;