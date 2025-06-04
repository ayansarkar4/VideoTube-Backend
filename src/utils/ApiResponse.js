class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data || null; // if no data is provided then it will be set to null by default.
    this.message = message;
    this.success = statusCode < 400;
  }
}
export default ApiResponse;
