import dayjs from 'dayjs';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export class Sheets {
  private doc: GoogleSpreadsheet;

  /**
   * @param sheetId The sheet ID
   */
  constructor(sheetId: string) {
    this.doc = new GoogleSpreadsheet(sheetId);
  }

  /**
   * Prepare sheet
   */
  async prepare(client_email: string, private_key: string): Promise<void> {
    // Authentication
    await this.doc.useServiceAccountAuth({
      client_email,
      private_key
    });
    // Load info
    await this.doc.loadInfo();
  }

  /**
   * Create this month sheet.
   */
  async createThisMonthSheet(): Promise<void> {
    if(await this.isExistsThisMonthSheet()) {
      throw new Error('This month sheet is already created.');
    } else {
      await this.doc.addSheet({ title: Sheets.getThisMonthSheetName(), headerValues: ['日時', '温度', '湿度']});
    }
  }

  async isExistsThisMonthSheet(): Promise<boolean> {
    const shouldExistsSheetTitle = Sheets.getThisMonthSheetName();
    const latestSheet = this.doc.sheetsByTitle[shouldExistsSheetTitle];
    if(typeof latestSheet === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  async addRecord(timeStamp: string, temperature: number, humidity: number): Promise<void> {
    if(!this.isExistsThisMonthSheet()) {
      throw new Error('This month sheet has not been created. Run <Sheet>.createThisMonthSheet() before run this.');
    }

    const sheet = this.doc.sheetsByTitle[Sheets.getThisMonthSheetName()];
    const record = await sheet.addRow({ '日時': timeStamp, '温度': temperature, '湿度': humidity });
    return record.save();
  }

  static getThisMonthSheetName(): string {
    const date = dayjs().format('YYYY-MM');
    return `${date} 温湿度`;
  }
}