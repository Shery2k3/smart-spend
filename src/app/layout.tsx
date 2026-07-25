import type { Metadata } from "next";
import { ConfigProvider, theme } from "antd";
import { Poppins } from "next/font/google";
import "@ant-design/v5-patch-for-react-19";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/auth";
import Loader from "@/components/Loaders/FullPageLoader/Loader";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { QueryProvider } from "@/providers/QueryProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SmartSpend - Expense & Income Tracker",
  description: "Track your expenses and incomes with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#cdf345",
              colorText: "#ffffff",
              colorTextDescription: "#ffffff",
              colorTextPlaceholder: "#8c8c8c",
              colorIcon: "#fff",
              colorBgContainer: "#1e1e1f",
              colorFillSecondary: "#1e1e1f",
              colorFillTertiary: "#1e1e1f",
              colorFillQuaternary: "#1e1e1f",
              colorTextLightSolid: "#2e2d2d",
              fontFamily: "var(--font-poppins)",
              fontFamilyCode: "var(--font-poppins)",
            },
            components: {
              Input: {
                colorBgContainer: "#1e1e1f",
              },
              Select: {
                colorBgContainer: "#1e1e1f",
                colorBgElevated: "#1e1e1f",
                colorIcon: "#fff",
                optionSelectedBg: "#2e2d2d",
                optionActiveBg: "#2e2d2d75",
                controlItemBgHover: "#2e2d2d75",
              },
              DatePicker: {
                colorBgContainer: "#1e1e1f",
                colorBgElevated: "#1e1e1f",
                colorIcon: "#fff",
                activeBg: "#2e2d2d",
              },
              Table: {
                headerBg: "#2F2F2F",
                headerColor: "#ffffff",
              },
              Segmented: {
                itemSelectedBg: "#cdf345",
                borderRadius: 12,
                borderRadiusLG: 12,
                borderRadiusSM: 12,
                borderRadiusXS: 12,
                itemSelectedColor: "rgba(0,0,0,0.88)",
                itemColor: "rgba(255,255,255,0.65)",
              },
              Message: {
                contentBg: "#1e1e1f",         
                colorError: "#f34545",       
                colorInfo: "#579cfd",      
                colorText: "#ffffff", 
                colorSuccess: "#cdf345 61.20%)"    
              },
              Button: {
                primaryColor: "#000",
                textTextColor: "#000",
                colorTextDisabled: "#8c8c8c",
              },
            },
            algorithm: theme.darkAlgorithm,
          }}
        >
          <SessionProvider session={session}>
            <QueryProvider>
              <CurrencyProvider>
                <Loader />
                {children}
              </CurrencyProvider>
            </QueryProvider>
          </SessionProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
