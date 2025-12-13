import { PublicodesError } from './error'

export function normalizeDateString(dateString: string): string {
	let [day, month, year] = dateString.split('/')
	if (!year) {
		;[day, month, year] = ['01', day, month]
	}
	return normalizeDate(+year, +month, +day)
}

const pad = (n: number): string => (+n < 10 ? `0${n}` : '' + n)
export function normalizeDate(
	year: number,
	month: number,
	day: number,
): string {
	const date = new Date(+year, +month - 1, +day)
	if (!+date || date.getDate() !== +day) {
		throw new PublicodesError(
			'SyntaxError',
			`La date ${day}/${month}/${year} n'est pas valide`,
			{ dottedName: '' },
		)
	}
	return `${pad(day)}/${pad(month)}/${pad(year)}`
}

export function convertToDate(value: string): Date {
	const [day, month, year] = normalizeDateString(value).split('/')
	const result = new Date(+year, +month - 1, +day)
	// Reset date to utc midnight for exact calculation of day difference (no
	// daylight saving effect)
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset())
	return result
}

export function convertToString(date: Date): string {
	return normalizeDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function getRelativeDate(date: string, dayDifferential: number): string {
	const relativeDate = new Date(convertToDate(date))
	relativeDate.setDate(relativeDate.getDate() + dayDifferential)
	return convertToString(relativeDate)
}

export function getRelativeDateMonth(date: string, monthDifferential: number): string {
	const relativeDate = new Date(convertToDate(date))
	const finalDate = new Date(relativeDate.getFullYear(), relativeDate.getMonth() + monthDifferential, relativeDate.getDate())
	return convertToString(finalDate)
}

export function getRelativeDateYear(date: string, yearDifferential: number): string {
	const relativeDate = new Date(convertToDate(date))
	const finalDate = new Date(relativeDate.getFullYear() + yearDifferential, relativeDate.getMonth(), relativeDate.getDate())
	return convertToString(finalDate)
}

export function getYear(date: string): number {
	return +date.slice(-4)
}

export function getTrimestreCivil(date: string) {
	const [, month, year] = date.split('/')
	const trimester = Math.floor((Number.parseInt(month, 10) - 1) / 3)
	const startingMonth = 3 * trimester + 1
	return `01/${startingMonth.toString().padStart(2, '0')}/${year}`
}

export function getDifferenceInDays(from: string, to: string): number {
	const millisecondsPerDay = 1000 * 60 * 60 * 24
	return (
		(convertToDate(to).getTime() - convertToDate(from).getTime()) /
		millisecondsPerDay
	)
}

export function getDifferenceInMonths(from: string, to: string): number {
	// We want to compute the difference in actual month between the two dates
	// For date that start during a month, a pro-rata will be done depending on
	// the duration of the month in days
	const [dayFrom, monthFrom, yearFrom] = from.split('/').map((x) => +x)
	const [dayTo, monthTo, yearTo] = to.split('/').map((x) => +x)
	const numberOfFullMonth = monthTo - monthFrom + 12 * (yearTo - yearFrom)
	const numDayMonthFrom = new Date(yearFrom, monthFrom, 0).getDate()
	const numDayMonthTo = new Date(yearTo, monthTo, 0).getDate()
	const prorataMonthFrom = (dayFrom - 1) / numDayMonthFrom
	const prorataMonthTo = dayTo / numDayMonthTo
	return numberOfFullMonth - prorataMonthFrom + prorataMonthTo
}

export function getDifferenceInYears(from: string, to: string): number {
	const differenceInDays = getDifferenceInDays(from, to)

	const isLeapYear = (year: number) =>
		(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
	const after1stMarch = (date: Date) =>
		date >= new Date(date.getFullYear(), 2, 1)

	const fromDate = convertToDate(from)
	const toDate = convertToDate(to)

	const fromYear = fromDate.getFullYear() + (after1stMarch(fromDate) ? 1 : 0)
	const toYear = toDate.getFullYear() + (after1stMarch(fromDate) ? 0 : -1)

	const leapYearsCount = Array.from(
		{ length: toYear - fromYear + 1 },
		(_, i) => fromYear + i,
	).filter(isLeapYear).length

	return (differenceInDays - leapYearsCount) / 365
}

export function getDifferenceInTrimestreCivils(
	from: string,
	to: string,
): number {
	return (
		Math.floor(
			getDifferenceInMonths(getTrimestreCivil(from), getTrimestreCivil(to)) / 3,
		) + 1
	)
}

export function getDifferenceInYearsCivil(from: string, to: string): number {
	const fromYear = '01/' + getYear(from)
	const toYear = '01/' + getYear(to)
	return Math.floor(getDifferenceInYears(fromYear, toYear)) + 1
}

export function countWeekday(start: Date, end: Date, weekday: number): number {
	// Normalize to start-of-day : do not take into account hour
	const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
	const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

	// Find first matching weekday on or after start date
	const delta = (weekday - s.getDay() + 7) % 7;
	s.setDate(s.getDate() + delta);

	// If first occurrence is past end, no matches
	if (s > e) return 0;

	// Count by jumping in 7-day increments
	const oneWeek = 7 * 24 * 60 * 60 * 1000;

	return Math.floor((e.getTime() - s.getTime()) / oneWeek) + 1;
}

export function dateOfEaster(year: number): string {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);   // 3 = mars, 4 = avril
	const day = ((h + l - 7 * m + 114) % 31) + 1;

	return normalizeDate(year, month, day);
}

export function datesJoursFeriesForYear(annee: number, alsace: boolean = false): string[] {
	const res: string[] = [];

	// --- Jours fixes ---
	res.push(normalizeDate(annee, 1, 1));    // Jour de l'an
	res.push(normalizeDate(annee, 5, 1));    // Fête du Travail
	res.push(normalizeDate(annee, 5, 8));    // Victoire 1945
	res.push(normalizeDate(annee, 7, 14));   // Fête Nationale
	res.push(normalizeDate(annee, 8, 15));   // Assomption
	res.push(normalizeDate(annee, 11, 1));   // Toussaint
	res.push(normalizeDate(annee, 11, 11));  // Armistice
	res.push(normalizeDate(annee, 12, 25));  // Noël

	// --- Jours dépendants de Pâques ---
	const paques = dateOfEaster(annee);

	res.push(paques);   // Dimanche de Pâques
	res.push(getRelativeDate(paques, 1));   // Lundi de Pâques
	res.push(getRelativeDate(paques, 39));  // Ascension
	res.push(getRelativeDate(paques, 49));  // Dimanche de Pentecôte
	res.push(getRelativeDate(paques, 50));  // Lundi de Pentecôte
	if (alsace)
	{
		res.push(getRelativeDate(paques, -3));  // Vendredi saint
		res.push(normalizeDate(annee, 12, 26));  // Saint Etienne
	}

	return res;
}

export function howManyJoursFeriesInTimePeriod(d1: Date, d2: Date, repos: boolean = false, alsace: boolean = false): number {
	const start = d1
	const end = d2

	let jf: string[] = []
	for (let year = start.getFullYear() ; year <= end.getFullYear() ; year += 1)
	  jf = jf.concat(datesJoursFeriesForYear(year,alsace))

	let count = 0
	for (const d of jf) {
		const jsDate = convertToDate(d)
		const inPeriod = jsDate >= start && jsDate <= end
		const isRepos = [0, 6].includes(jsDate.getDay())

		if (inPeriod) {
			if (repos)
			{
				if (!isRepos) count ++
			}
			else count++
		}
	}

	return count
}
