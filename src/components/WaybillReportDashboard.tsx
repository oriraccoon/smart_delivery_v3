import React, { useState } from 'react';
import { MatchingError } from '../types';
import { AlertCircle, CheckCircle, HelpCircle, Package, ArrowRight, Clipboard } from 'lucide-react';

interface WaybillReportDashboardProps {
  matchCount: number;
  softMatchCount: number;
  unfilledErrors: MatchingError[];
  unusedErrors: MatchingError[];
  totalInputRows: number;
}

export default function WaybillReportDashboard({
  matchCount,
  softMatchCount,
  unfilledErrors,
  unusedErrors,
  totalInputRows
}: WaybillReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<'unfilled' | 'unused'>('unfilled');

  const totalSuccess = matchCount + softMatchCount;
  const successRate = totalInputRows > 0 ? Math.round((totalSuccess / totalInputRows) * 100) : 0;

  return (
    <div id="waybill-report-dashboard" className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
      
      {/* 요약 비주얼 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 성공률 */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">송장 매칭 성공률</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{successRate}%</div>
            <div className="text-[10px] text-slate-400 mt-1">총 {totalSuccess} / {totalInputRows}건</div>
          </div>
        </div>

        {/* 일반 매칭 건수 */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">일반 완전 매칭</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{matchCount}건</div>
            <div className="text-[10px] text-slate-400 mt-1">키 정보 100% 일치</div>
          </div>
        </div>

        {/* 부분 매칭 건수 */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <RefreshCwIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">지능형 부분 매칭</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{softMatchCount}건</div>
            <div className="text-[10px] text-slate-400 mt-1">우편번호 기준 유추 성공</div>
          </div>
        </div>

        {/* 미매칭 누락 건수 */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">누락/미매칭 주문</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{unfilledErrors.length}건</div>
            <div className="text-[10px] text-slate-400 mt-1">송장을 찾을 수 없음</div>
          </div>
        </div>

      </div>

      {/* 매칭 상세 오류 내역 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* 내부 탭 */}
        <div className="flex border-b border-slate-150 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('unfilled')}
            className={`flex-1 py-3 px-4 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'unfilled'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            [유형 1] 못 채운 값 ({unfilledErrors.length}건) - 송장이 없는 주문
          </button>
          <button
            onClick={() => setActiveTab('unused')}
            className={`flex-1 py-3 px-4 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'unused'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            [유형 2] 못 넣은 값 ({unusedErrors.length}건) - 매치 대상이 없는 송장
          </button>
        </div>

        {/* 탭 테이블 콘텐츠 */}
        <div className="p-4">
          {activeTab === 'unfilled' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                인풋(주문)에는 정보가 존재하나 소스(재출력) 파일에 송장이 없는 주문들입니다. 소스 파일에 해당 주문이 누락되었거나 정보(수량/우편번호 등)가 서로 일치하지 않는 것이 원인입니다.
              </p>

              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-150">
                    <tr>
                      <th className="px-3 py-2.5">수령인</th>
                      <th className="px-3 py-2.5">우편번호</th>
                      <th className="px-3 py-2.5">수량</th>
                      <th className="px-3 py-2.5">품목명 (일부)</th>
                      <th className="px-3 py-2.5">원인 진단</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unfilledErrors.map((err, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{err.name}</td>
                        <td className="px-3 py-2.5 font-mono">{err.zipCode}</td>
                        <td className="px-3 py-2.5">{err.qty}</td>
                        <td className="px-3 py-2.5 max-w-xs truncate" title={err.prod}>{err.prod}</td>
                        <td className="px-3 py-2.5 text-rose-600 font-medium">{err.reason}</td>
                      </tr>
                    ))}
                    {unfilledErrors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                          누락 주문이 존재하지 않습니다. 모든 주문에 운송장 매칭 완료! ✨
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                소스(재출력) 파일에는 송장이 존재하나, 인풋(주문) 파일에 매치 대상이 없는 건들입니다. 해당 고객이 주문을 전격 취소했거나 인풋 파일에서 이미 사전에 걸러진 항목일 확률이 대단히 높습니다.
              </p>

              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-150">
                    <tr>
                      <th className="px-3 py-2.5">대상자</th>
                      <th className="px-3 py-2.5">우편번호</th>
                      <th className="px-3 py-2.5">수량</th>
                      <th className="px-3 py-2.5">품목명 (일부)</th>
                      <th className="px-3 py-2.5">원인 진단</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unusedErrors.map((err, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{err.name}</td>
                        <td className="px-3 py-2.5 font-mono">{err.zipCode}</td>
                        <td className="px-3 py-2.5">{err.qty}</td>
                        <td className="px-3 py-2.5 max-w-xs truncate" title={err.prod}>{err.prod}</td>
                        <td className="px-3 py-2.5 text-amber-600 font-medium">{err.reason}</td>
                      </tr>
                    ))}
                    {unusedErrors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                          미사용 송장이 존재하지 않습니다. 모든 송장이 주문과 정확히 매칭되었습니다!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// 미려한 회전 새로고침 아이콘 컴포넌트
function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
