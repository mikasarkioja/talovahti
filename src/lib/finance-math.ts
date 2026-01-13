export const financeMath = {
    calculateVastikeImpact(loanAmount: number, interestRate: number, termYears: number, totalShares: number, totalM2: number) {
        // Annuity Formula: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
        const monthlyRate = interestRate / 12 / 100;
        const totalMonths = termYears * 12;
        
        let monthlyPayment = 0;
        if (monthlyRate === 0) {
            monthlyPayment = loanAmount / totalMonths;
        } else {
            monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }

        return {
            perShare: monthlyPayment / totalShares,
            perM2: monthlyPayment / totalM2,
            totalMonthly: monthlyPayment
        };
    },

    calculateSinkingFund(targetAmount: number, years: number, interestRate: number) {
        // Future Value of Annuity: PMT = FV * r / ((1+r)^n - 1)
        // Here we want to find how much to SAVE monthly
        const monthlyRate = (interestRate || 2.0) / 12 / 100; // Assume 2% safe return
        const months = years * 12;

        let monthlySave = 0;
        if (monthlyRate === 0) {
            monthlySave = targetAmount / months;
        } else {
            monthlySave = targetAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
        }

        return monthlySave;
    }
}
