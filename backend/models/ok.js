-- FUNCTION: public.get_locationavaibalities(integer, integer, text, text, text)

-- DROP FUNCTION IF EXISTS public.get_locationavaibalities(integer, integer, text, text, text);

CREATE OR REPLACE FUNCTION public.get_locationmaintenances(
	p_page_size integer,
	p_offset  integer,
	p_order_by text,
	p_order_dir text,
	p_search text)
    RETURNS TABLE(locationmaintenanceid uuid, description character varying, datetimefrom time without time zone, datetimeto time without time zone, datecreated timestamp with time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
	sqlquery text;
	varorderby text;
	varorderdir text;
	varpaging text;
	orderdirdefault text := 'asc';
	
BEGIN
IF (COALESCE(p_order_by, '') = 'city' ) THEN
		varorderby := format('ORDER BY  %1$s',p_order_by);
	ELSEIF(COALESCE(p_order_by, '') = 'datecreated' ) THEN
		varorderby := format('ORDER BY  %1$s',p_order_by);
	ELSEIF (COALESCE(p_order_by, '') = 'datemodified' ) THEN
			varorderby := format('ORDER BY  %1$s',p_order_by);
	ELSEIF (COALESCE(p_order_by, '') = 'datetimefrom' ) THEN
			varorderby := format('ORDER BY  %1$s',p_order_by);
	ELSEIF (COALESCE(p_order_by, '') = 'datetimeto' ) THEN
			varorderby := format('ORDER BY  %1$s',p_order_by);
	else
		varorderby := 'ORDER BY description';
	END IF;
IF (COALESCE(p_order_dir, '') <> '' ) THEN
		varorderdir := format(' %1$s',p_order_dir);
		
	else 
		varorderdir := format(' %1$s',orderdirdefault);
	END IF;

varpaging :=FORMAT(' OFFSET %1$s LIMIT %2$s', p_offset, p_page_size);

sqlquery := format('  select locationmaintenance.guid, locationmaintenance.description, locationmaintenance.datetimefrom, locationmaintenance.datetimeto,  locationmaintenance.datecreated
            from locationmaintenance 
WHERE (locationmaintenance.description ILIKE ''%%'' || COALESCE(%L, '''') || ''%%'' OR 
locationmaintenance.datetimefrom ILIKE ''%%'' || COALESCE(%L, '''') || ''%%''  OR 
locationmaintenance.datetimeto ILIKE ''%%'' || COALESCE(%L, '''') || ''%%'' OR
locationmaintenance.datetimeto ILIKE ''%%'' || COALESCE(%L, '''') || ''%%'')
AND locationavailability.datedeleted is NULL ', p_search,p_search,p_search,p_search);
RETURN QUERY EXECUTE  sqlquery || varorderby || varorderdir || varpaging ;

END;
$BODY$;

ALTER FUNCTION public.get_locationavaibalities(integer, integer, text, text, text)
    OWNER TO admin;
