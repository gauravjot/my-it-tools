import {useToast} from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import BaseSidebarLayout from "./_layout";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ClipboardList, Trash2} from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { dateTimePretty } from "@/lib/dateTimeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import exportFromJSON from 'export-from-json';
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const STATUSES = ['submitted', 'interview', 'offer', 'ghosted', 'declined'];

const schema = z.object({
	role: z.string().min(2),
    company: z.string().min(2),
    application_detail_url: z.string().url().optional(),
    portal_url: z.string().url().optional(),
    date: z.string(),
    status: z.enum(['submitted', 'interview', 'offer', 'ghosted', 'declined'])
});

export default function JobApplicationTrackerTool() {
	const [jobApps, setJobApps] = useLocalStorage<z.infer<typeof schema>[]>("job_tracker_applications", []);
    const [statusFilter, setStatusFilter] = useLocalStorage<z.infer<typeof schema>['status'] | null>("job_tracker_status_filter", null);
	const {toast} = useToast();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString(),
        },
		mode: "all"
	});
	const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
		if (!jobApps.find((t) => t.role+t.company === data.role+data.company)){
			setJobApps([...jobApps, data]);
            form.reset();
		}
		toast({
			description: "Job application has been added!",
		});
	}

	return (
		<BaseSidebarLayout title="Job Application Tracker">
            <div className="m-8 flex flex-col lg:flex-row">
                <h1 className="text-2xl flex-1 font-bold tracking-tight">Job Application Tracking Tool</h1>
                <div className="flex gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={statusFilter ? "default" : "outline"}>
                                {statusFilter ? "Filter: " + statusFilter :  "Set Status Filter"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuItem 
                                    className="py-2 pl-3"
                                    onClick={() => {
                                        setStatusFilter(null);
                                    }}
                                >
                                    None
                                </DropdownMenuItem>
                                {STATUSES.map((status) => 
                                    <DropdownMenuItem 
                                        className="py-1"
                                        onClick={() => {
                                            setStatusFilter(status as any);
                                        }}
                                    >
                                        <StatusBadge status={status as any} />
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant={"outline"}
                        onClick={()=>{
                            const data = jobApps
                            const fileName = 'job-applications-'+(new Date()).toISOString()
                            const exportType =  exportFromJSON.types.csv
                            exportFromJSON({ data, fileName, exportType })
                        }}
                        disabled={jobApps.length === 0}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>
            <div className="flex flex-col xl:flex-row m-8 gap-4 max-w-[2000px]">
                <div className="flex-1 order-2 xl:order-1 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Role &mdash; Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Links</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobApps.filter((app) => (statusFilter) ? app.status === statusFilter : true).map((application) => (
                                <TableRow key={application.role+application.company+application.date}>
                                    <TableCell className="font-medium min-w-[200px]">{application.role} &mdash; {application.company}</TableCell>
                                    <TableCell className="w-[130px]">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button>
                                                    <StatusBadge className="cursor-pointer select-none" status={application.status}/>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuGroup>
                                                    {STATUSES.map((status) => 
                                                        <DropdownMenuItem 
                                                            className="py-1"
                                                            onClick={() => {
                                                                let newArr = jobApps.slice();
                                                                let index = newArr.findIndex((a) => a.role+a.company+a.date === application.role+application.company+application.date);
                                                                let row = newArr.splice(index, 1)[0];
                                                                row.status = status as any;
                                                                setJobApps([...newArr.slice(0, index), row, ...newArr.slice(index)]);
                                                            }}
                                                        >
                                                            <StatusBadge status={status as any} />
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{dateTimePretty(application.date)}</TableCell>
                                    <TableCell className="flex place-items-center w-full gap-4">
                                        <div className="flex-1 text-sm text-muted-foreground">
                                            {application.application_detail_url && application.application_detail_url.length > 0 ? 
                                                <a href={application.application_detail_url} target="_blank">Application Link</a> 
                                                :
                                                <></>
                                            }
                                            {application.portal_url && application.portal_url.length > 0 ? 
                                                <>{" • "}<a href={application.portal_url} target="_blank">Portal Link</a></>
                                                :
                                                <></>
                                            }
                                        </div>
                                        <Button 
                                            variant={"ghost"} 
                                            className="bg-zinc-200 dark:bg-zinc-800 hover:bg-destructive dark:hover:bg-destructive hover:text-white aspect-square !p-1 size-7"
                                            onClick={() => {
                                                let newArr = jobApps.slice();
                                                let index = newArr.findIndex((a) => a.role+a.company+a.date === application.role+application.company+application.date);
                                                newArr.splice(index, 1);
                                                setJobApps(newArr);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell className="text-right">{jobApps.length} applications</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <div className="flex order-1 xl:order-2 w-full xl:w-80 mx-auto place-items-center">
                    <div className="w-full p-6 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
                        <h2 className="text-xl font-bold tracking-tight">Add Application</h2>
                        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                            Enter details to add to the tracker
                        </p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jr Software Engineer" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Microsoft" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="application_detail_url"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Application URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/job/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="portal_url"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Portal URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://myworkday.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select application status" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="interview">Interview phase</SelectItem>
                                            <SelectItem value="offer">Offer received</SelectItem>
                                            <SelectItem value="ghosted">Ghosted</SelectItem>
                                            <SelectItem value="declined">Declined</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <div className="p-px"></div>
                            <Button
                                variant="default"
                                type="submit"
                                className="flex-1 flex gap-2 w-full"
                            >
                                <ClipboardList className="size-4" />
                                <span>Save to browser</span>
                            </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
		</BaseSidebarLayout>
	);
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    status: "submitted" | "interview" | "offer" | "ghosted" | "declined";
}

function StatusBadge({status, ...props}: StatusBadgeProps) {
    return (
        <div {...props}>
            <div className="border-muted hover:bg-muted-foreground/20 border rounded-full px-2 py-1 text-sm text-foreground/80 inline-flex gap-2 place-items-center">
                <div className={"size-2 rounded-full " + (status === "submitted" ? "bg-blue-500" : status === "interview" ? "bg-teal-500" : status === "declined" ? "bg-red-500" : status === "ghosted" ? "bg-zinc-500" : "bg-green-500")}></div>
                {status}
            </div>
        </div>
        )
}