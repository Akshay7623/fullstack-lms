import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import RobotoRegular from "../fonts/Roboto-Regular.ttf";
import RobotoItalic from "../fonts/Roboto-Italic.ttf";
import RobotoBold from "../fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: "Roboto",
    height: "100%",
  },
  heading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
    borderBottom: "1px solid #ff5a5a",
    paddingBottom: 5,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    borderBottom: "1px solid #aaa",
  },
  note: {
    fontSize: 10,
    marginTop: 12,
    fontStyle: "italic",
  },
  bankSection: {
    fontSize: 10,
    marginTop: 10,
    borderTop: "1 solid #aaa",
    paddingTop: 10,
  },
  row: {
    marginTop: 10,
    borderBottom: "1px solid #aaa",
  },
  contentWrapper: {
    flexGrow: 1,
  },
});

const ReceiptPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>{data.metaData.title}</Text>
      <View style={styles.contentWrapper}>
        <View style={styles.section}>
          <Text style={{ borderBottom: "1px solid #aaa" }}>
            <Text style={styles.label}>DATE: </Text>
            {data.studentInfo.date}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>RECEIPT NO: </Text>
            {data.studentInfo.receiptNo}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>STUDENT NAME: </Text>
            {data.studentInfo.name}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>PURPOSE OF PAYMENT: </Text>
            {data.studentInfo.purpose}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>CAMPUS: </Text>
            {data.studentInfo.campus}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>FEES PAID: </Text> ₹{" "}
            {data.studentInfo.amount.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>PAYMENT MODE: </Text>
            {data.studentInfo.paymentMode}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>REFERENCE NUMBER: </Text>
            {data.studentInfo.referenceNumber}
          </Text>
        </View>

        <Text style={styles.note}>
          <Text>NOTE: </Text>FOR ALL TRANSACTIONS GST OF 18% IS APPLICABLE, ALL
          FEE PAYMENTS ARE NON-REFUNDABLE.
        </Text>
        
        <Text style={{ fontSize: 10, marginTop: 8 }}>
          By making this payment, you agree to the Student Code of Conduct and
          Terms & Conditions mentioned on this Payment Receipt and as updated
          regularly on website{" "}
          <Link
            style={{ borderBottom: "none" }}
            href={data.metaData.termAndConditionUrl}
          >
            {data.metaData.website}
          </Link>
          .
        </Text>

        <View style={styles.bankSection}>
          <Text style={styles.label}>CAMPUS DETAILS : </Text>
          <Text style={{ paddingTop: 10 }}>
            ACCOUNT NAME: {data.campusInfo.accountName}
          </Text>
          <Text style={{ paddingTop: 6 }}>
            GST NUMBER: {data.campusInfo.gstn}
          </Text>
          <Text style={{ marginTop: 8, fontWeight: "bold" }}>
            CORPORATE DETAILS :
          </Text>
          <Text style={{ paddingTop: 6 }}>
            ACCOUNT NAME: {data.corporateInfo.accountName}
          </Text>
          <Text style={{ paddingTop: 6 }}>BANK: {data.corporateInfo.bank}</Text>
          <Text style={{ paddingTop: 6 }}>
            ACCOUNT NUMBER: {data.corporateInfo.accountNumber}
          </Text>
          <Text style={{ paddingTop: 6 }}>
            IFSC CODE: {data.corporateInfo.ifscCode}
          </Text>
          <Text style={{ paddingTop: 6 }}>
            GSTIN: {data.corporateInfo.gstn}
          </Text>
          <Text style={{ paddingTop: 6 }}>PAN: {data.corporateInfo.pan}</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, textAlign: "center" }}>
          This is an electronically generated receipt, hence does not require a
          signature.
        </Text>
      </View>

      <Text
        style={{
          fontSize: 12,
          textAlign: "center",
          paddingVertical: 20,
          backgroundColor: "#000045",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {data.metaData.website}
      </Text>
    </Page>
  </Document>
);

export default ReceiptPDF;