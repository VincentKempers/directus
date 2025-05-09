import { useEnv } from '@directus/env';
import type { Knex } from 'knex';
import { getDefaultIndexName } from '../../../../utils/get-default-index-name.js';
import { SchemaHelper, type SortRecord } from '../types.js';

const env = useEnv();

export class SchemaHelperMySQL extends SchemaHelper {
	override generateIndexName(
		type: 'unique' | 'foreign' | 'index',
		collection: string,
		fields: string | string[],
	): string {
		return getDefaultIndexName(type, collection, fields, { maxLength: 64 });
	}

	override async getDatabaseSize(): Promise<number | null> {
		try {
			const result = (await this.knex
				.sum('size AS size')
				.from(
					this.knex
						.select(this.knex.raw('data_length + index_length AS size'))
						.from('information_schema.TABLES')
						.where('table_schema', '=', String(env['DB_DATABASE']))
						.as('size'),
				)) as Record<string, any>[];

			return result[0]?.['size'] ? Number(result[0]?.['size']) : null;
		} catch {
			return null;
		}
	}

	override addInnerSortFieldsToGroupBy(
		groupByFields: (string | Knex.Raw)[],
		sortRecords: SortRecord[],
		hasRelationalSort: boolean,
	) {
		if (hasRelationalSort) {
			/*
			** MySQL **

			MySQL only requires all selected sort columns that are not functionally dependent on the primary key to be included.

			> If the ONLY_FULL_GROUP_BY SQL mode is enabled (which it is by default),
			  MySQL rejects queries for which the select list, HAVING condition, or ORDER BY list refer to
			  nonaggregated columns that are neither named in the GROUP BY clause nor are functionally dependent on them.

			https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html

			MySQL allows aliases to be used in the GROUP BY clause

			> You can use the alias in GROUP BY, ORDER BY, or HAVING clauses to refer to the column:

			https://dev.mysql.com/doc/refman/8.4/en/problems-with-alias.html

			** MariaDB **

			MariaDB does not document how it supports functional dependent columns in GROUP BY clauses.
			But testing shows that it does support the same features as MySQL in this area.

			MariaDB allows aliases to be used in the GROUP BY clause

			> The GROUP BY expression can be a computed value, and can refer back to an identifer specified with AS.

			https://mariadb.com/kb/en/group-by/#group-by-examples
			 */

			groupByFields.push(...sortRecords.map(({ alias }) => alias));
		}
	}
}
