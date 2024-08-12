//logout of tovy

import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import bcrypt from 'bcrypt'
import * as noblox from 'noblox.js'
import prisma from '@/utils/database';

export default withSessionRoute(handler);

function getUserID(name: string): Promise<string> {
    return new Promise((res, rej) => {
        fetch(`https://www.roblox.com/users/profile?username=${name}`)
            .then(r => {
                // check to see if URL is invalid.
                if (!r.ok) { throw "Invalid response"; }
                // return the only digits in the URL "the User ID"
                const match = r.url.match(/\d+/);
                if (match) {
                    return match[0];
                } else {
                    throw "No user ID found in URL";
                }
            })
            .then(id =>{
                // this is where you get your ID
                console.log(id);
                res(id);
            })
            .catch(error => rej(error));
    });
}

function compare(A: any,B: any): Promise<any> {
	return new Promise((res, rej) => {
		if (A == B) {
			return true
		} else {
			return false
		}
	}
}


type User = {
	userId: number
	username: string
	displayname: string
	thumbnail: string
}

type response = {
	success: boolean
	error?: string
	user?: User
	workspaces?: {
		groupId: number
		groupthumbnail: string
		groupname: string
	}[]
}

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<response>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

	const idold = await getUserID(req.body.username)
	let id = parseInt(idold, 10);

	if (!id) return res.status(404).json({ success: false, error: 'Please enter a valid username' })
	const user = await prisma.user.findUnique({
		where: {
			userid: id
		},
		select: {
			info: true,
			roles: true,
		}
	})
	if (!user?.info?.passwordhash) return res.status(401).json({ success: false, error: 'Invalid username or password' })
	const valid = await compare(req.body.password,user.info?.passwordhash)//bcrypt.compare(req.body.password, user.info?.passwordhash)
	if (!valid) return res.status(401).json({ success: false, error: 'Invalid username or password' })
	req.session.userid = id
	await req.session?.save()


	const tovyuser: User = {
		userId: req.session.userid,
		username: await getUsername(req.session.userid),
		displayname: await getDisplayName(req.session.userid),
		thumbnail: await getThumbnail(req.session.userid)
	}
	let roles: any[] = [];
	if (user?.roles.length) {
		for (const role of user.roles) {
			roles.push({
				groupId: role.workspaceGroupId,
				groupThumbnail: await noblox.getLogo(role.workspaceGroupId),
				groupName: await noblox.getGroup(role.workspaceGroupId).then(group => group.name),
			})
		}
	}

	res.status(200).json({ success: true, user: tovyuser, workspaces: roles })
}