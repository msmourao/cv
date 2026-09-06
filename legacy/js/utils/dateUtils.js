/**
 * Date Utilities
 * Handles date formatting and conversion functions
 */

/**
 * Converts a date string to MM/yyyy format
 * @param {string} dateStr - Date string to format
 * @param {string} lang - Language code ('pt' or 'en')
 * @returns {string} Formatted date string
 */
export function formatDateToMMYYYY(dateStr, lang) {
    const monthMapPt = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    const monthMapEn = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    
    const monthMap = lang === 'pt' ? monthMapPt : monthMapEn;
    const present = lang === 'pt' ? 'Presente' : 'Present';
    
    if (dateStr.includes('–') || dateStr.includes('—') || dateStr.includes('-')) {
        const separator = dateStr.includes('–') ? '–' : (dateStr.includes('—') ? '—' : '-');
        const parts = dateStr.split(separator).map(s => s.trim());
        
        const formatPart = (part) => {
            if (part.toLowerCase() === present.toLowerCase()) {
                return lang === 'pt' ? 'Presente' : 'Present';
            }
            const words = part.toLowerCase().split(' ');
            if (words.length >= 2) {
                const month = words[0];
                const year = words[1];
                const monthNum = monthMap[month] || month;
                return `${monthNum}/${year}`;
            }
            return part;
        };
        
        return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
    }
    
    return dateStr;
}


