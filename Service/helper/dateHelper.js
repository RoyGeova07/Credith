function normalizeDate(year, month, day) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const maxDay = Math.min(day, lastDay);

    return new Date(
        Date.UTC(year, month, maxDay)
    );
}

module.exports = {
    normalizeDate,
}
