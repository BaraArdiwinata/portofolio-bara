"use server";

import { prisma } from "@/lib/prisma";
import { getStockPrice } from "../lib/yahooFinance";
export async function handleStockAction(action: string, emiten: string, lotQuantity: number, hargaPerLembar: number) {
  const emitenUpper = emiten.toUpperCase();
  const totalLembar = lotQuantity * 100; // 1 lot = 100 lembar
  const totalInvested = totalLembar * hargaPerLembar;

  try {
    // ==========================================
    // LOGIC 1: BELI SAHAM (BUY)
    // ==========================================
    if (action === "BUY") {
      const existing = await prisma.stockPortfolio.findUnique({ where: { emitenCode: emitenUpper } });

      if (existing) {
        // Average Down/Up
        const newTotalLembar = (existing.lotQuantity * 100) + totalLembar;
        const newTotalInvested = existing.totalInvested + totalInvested;
        const newAverageBuyPrice = newTotalInvested / newTotalLembar;
        const newLotQuantity = Math.floor(newTotalLembar / 100);

        await prisma.stockPortfolio.update({
          where: { emitenCode: emitenUpper },
          data: { lotQuantity: newLotQuantity, averageBuyPrice: newAverageBuyPrice, totalInvested: newTotalInvested },
        });

        return `✅ *BUY ${emitenUpper} UPDATE*\n\n📊 Total: ${newLotQuantity} Lot\n💰 Avg Price: Rp${Math.round(newAverageBuyPrice).toLocaleString("id-ID")}\n💸 Total Investasi: Rp${newTotalInvested.toLocaleString("id-ID")}`;
      } else {
        // Beli Baru
        await prisma.stockPortfolio.create({
          data: { emitenCode: emitenUpper, lotQuantity, averageBuyPrice: hargaPerLembar, totalInvested },
        });

        return `✅ *BUY ${emitenUpper} BARU*\n\n📊 Lot: ${lotQuantity} Lot\n💰 Harga: Rp${hargaPerLembar.toLocaleString("id-ID")}/lembar\n💸 Total Investasi: Rp${totalInvested.toLocaleString("id-ID")}`;
      }
    }

    // ==========================================
    // LOGIC 2: JUAL SAHAM (SELL)
    // ==========================================
    if (action === "SELL") {
      const existing = await prisma.stockPortfolio.findUnique({ where: { emitenCode: emitenUpper } });
      
      if (!existing) return `❌ ${emitenUpper} tidak ditemukan di portfolio Anda.`;
      if (existing.lotQuantity < lotQuantity) return `❌ Lot tidak cukup! Sisa lot: ${existing.lotQuantity} Lot.`;

      const proceedsSell = totalLembar * hargaPerLembar;
      const investedPerSoldLot = existing.totalInvested / (existing.lotQuantity * 100);
      const investedOnSoldLot = totalLembar * investedPerSoldLot;
      
      const gainLoss = proceedsSell - investedOnSoldLot;
      const gainLossPercent = (gainLoss / investedOnSoldLot) * 100;
      const newLotQuantity = existing.lotQuantity - lotQuantity;

      if (newLotQuantity === 0) {
        await prisma.stockPortfolio.delete({ where: { emitenCode: emitenUpper } });
      } else {
        const newTotalInvested = existing.totalInvested - investedOnSoldLot;
        await prisma.stockPortfolio.update({
          where: { emitenCode: emitenUpper },
          data: { lotQuantity: newLotQuantity, totalInvested: newTotalInvested },
        });
      }

      return `✅ *SELL ${emitenUpper} BERHASIL*\n\n📊 Terjual: ${lotQuantity} Lot\n💵 Hasil Jual: Rp${proceedsSell.toLocaleString("id-ID")}\n\n${gainLoss >= 0 ? "📈 UNTUNG" : "📉 RUGI"}: Rp${Math.abs(gainLoss).toLocaleString("id-ID")} (${gainLossPercent.toFixed(2)}%)\nSisa di portofolio: ${newLotQuantity} Lot`;
    }

    // ==========================================
    // LOGIC 3: CEK HARGA & PORTOFOLIO (HOLD)
    // ==========================================
    if (action === "HOLD") {
      const portfolio = await prisma.stockPortfolio.findUnique({ where: { emitenCode: emitenUpper } });
      if (!portfolio) return `❌ ${emitenUpper} tidak ditemukan di portfolio Anda.`;

      const currentPrice = await getStockPrice(emitenUpper);
      if (!currentPrice) return `⚠️ Gagal menarik harga live ${emitenUpper} dari bursa. Coba sebentar lagi.`;

      const currentTotalLembar = portfolio.lotQuantity * 100;
      const totalValue = currentTotalLembar * currentPrice;
      const gainLoss = totalValue - portfolio.totalInvested;
      const gainLossPercent = (gainLoss / portfolio.totalInvested) * 100;

      await prisma.stockPortfolio.update({
        where: { emitenCode: emitenUpper },
        data: { currentPrice, totalValue, gainLoss, gainLossPercent },
      });

      return `📊 *INFO PORTOFOLIO: ${emitenUpper}*\n\n💰 Harga Live (IDX): Rp${currentPrice.toLocaleString("id-ID")}/lembar\n📈 Dimiliki: ${portfolio.lotQuantity} Lot\n💵 Nilai Sekarang: Rp${totalValue.toLocaleString("id-ID")}\n\n💵 Modal Awal: Rp${portfolio.totalInvested.toLocaleString("id-ID")}\n${gainLoss >= 0 ? "📈 UNTUNG" : "📉 RUGI"}: Rp${Math.abs(gainLoss).toLocaleString("id-ID")} (${gainLossPercent.toFixed(2)}%)`;
    }

    return "❌ Aksi tidak dikenali.";
  } catch (error) {
    console.error(`❌ Error handling ${action}:`, error);
    return `❌ Gagal memproses data saham ${emitenUpper}.`;
  }
}