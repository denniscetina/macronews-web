import { useMemo } from "react";

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [month, day, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
};

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const useProcessedOffers = (sourceData, options = {}) => {
    const {
        pageId = null, // Para filtrar por página en popups
        limit = null, // Límite de resultados
        shuffle = false, // Si se debe mezclar el array
        forCard = false, // Para transformar datos para OfferCardItem
        forPagePopUp = false, // Para transformar datos para pagePopUp
    } = options;

    const processedData = useMemo(() => {
        if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
            return [];
        }

        // 1. Filtrar ofertas válidas por fecha
        const now = new Date();
        const nowNormalized = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        let validOffers = sourceData.filter((item) => {
            const acf = item?.acf;
            if (!acf) return false;

            if (acf.showAdPermanently === true) {
                return true;
            }

            const startDateStr = acf.startDate;
            const expirationDateStr = acf.expirationDate;

            if (!startDateStr || !expirationDateStr) {
                return false;
            }

            const startDate = parseDate(startDateStr);
            const expirationDate = parseDate(expirationDateStr);

            if (
                !startDate ||
                !expirationDate ||
                isNaN(startDate.getTime()) ||
                isNaN(expirationDate.getTime())
            ) {
                return false;
            }

            startDate.setHours(0, 0, 0, 0);
            expirationDate.setHours(0, 0, 0, 0);

            return nowNormalized >= startDate && nowNormalized <= expirationDate;
        });

        // 2. Si se especifica pageId, filtrar por páginas para mostrar (popup)
        if (pageId) {
            validOffers = validOffers.filter((item) =>
                item.acf.pagePopUp?.pagesToDisplay?.some((page) => page.ID === pageId),
            );
        }

        // 3. Aplicar límite si es necesario
        if (limit && limit > 0) {
            validOffers = validOffers.slice(0, limit);
        }

        // 4. Mezclar si es necesario
        const result = shuffle ? shuffleArray(validOffers) : validOffers;

        // 5. Transformar datos según el propósito
        if (forCard) {
            return result.map((item) => ({
                ...item?.acf?.cardOffer,
                linksToOfferByGeolocation: item?.acf?.linksToOfferByGeolocation,
                showBookingCustom: item?.acf?.showBookingConfiguration,
                bookingButton: item?.acf?.bookingButton,
            }));
        }

        if (forPagePopUp) {
            return result.map((item) => ({
                ...item.acf.pagePopUp,
                linksToOfferByGeolocation: item?.acf?.linksToOfferByGeolocation,
            }));
        }

        // Por defecto, devolver los items completos
        return result;
    }, [sourceData, pageId, limit, shuffle, forCard, forPagePopUp]);

    return processedData;
};
